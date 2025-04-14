const express = require('express');
const app = express();
const port = 3000;
const { createServer } = require('http'); // Import Node's http module
const { Server } = require("socket.io"); 
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize, User, Todo, ScheduledTask, TaskLog } = require('./models');
const bcrypt = require('bcrypt');

const { initializeScheduler } = require('./batch/scheduler'); // Adjust path if needed

// --- Create HTTP server and integrate Socket.IO ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4000", // Your React app's origin
    methods: ["GET", "POST"],
    credentials: true
  }
});


// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4000', 
  credentials: true,              
}));
app.use(cookieParser());

function authenticateToken(req, res, next) {
  const token = req.cookies.token; 
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next(); 
  });
}

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });


});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userForToken = { id: user.id, username: user.username };
    const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });


    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 3600000 
    });

    res.json({ message: 'Login successful', username: user.username });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CRUD operations for todos

// GET all todos for authenticated user
app.get('/todos', authenticateToken, async (req, res) => {
  try {
    const userTodos = await Todo.findAll({ where: { userId: req.user.id } });
    res.json(userTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a specific todo
app.get('/todos/:id', authenticateToken, async (req, res) => {
  const todoId = parseInt(req.params.id);
  try {
    const todo = await Todo.findOne({ where: { id: todoId, userId: req.user.id } });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CREATE a new todo
app.post('/todos', authenticateToken, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  try {
    const newTodo = await Todo.create({
      userId: req.user.id,
      title,
      completed: false
    });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// UPDATE a todo
app.put('/todos/:id', authenticateToken, async (req, res) => {
  const todoId = parseInt(req.params.id);
  const { title, completed } = req.body;

  try {
    const todo = await Todo.findOne({ where: { id: todoId, userId: req.user.id } });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await todo.update({ title, completed });
    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a todo
app.delete('/todos/:id', authenticateToken, async (req, res) => {
  const todoId = parseInt(req.params.id);

  try {
    const todo = await Todo.findOne({ where: { id: todoId, userId: req.user.id } });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    await todo.destroy();
    res.json({ message: 'Todo deleted successfully', todo });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

app.get('/me', authenticateToken, (req, res) => {

  res.json({ username: req.user.username });
});
//crontabバッチ処理の実行
app.get('/api/scheduled-tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await ScheduledTask.findAll({
      order: [['name', 'ASC']], // 名前順でソート
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET 特定タスクのログを取得
app.get('/api/scheduled-tasks/:taskId/logs', authenticateToken, async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const limit = parseInt(req.query.limit) || 100; 

  try {
    const logs = await TaskLog.findAll({
      where: { taskId: taskId },
      order: [['createdAt', 'DESC']], 
      limit: limit,
      include: [{ model: ScheduledTask, as: 'task', attributes: ['name'] }] 
    });
    if (!logs) {
      return res.status(404).json({ message: 'Task logs not found' });
    }
    res.json(logs);
  } catch (error) {
    console.error(`Error fetching logs for task ${taskId}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const startServer = async () => {
  try {
    await sequelize.sync({ alter: false }); // Use alter:false or migrations in prod
    console.log('Database synced');

    // Pass the 'io' object to the scheduler if it needs to emit events
    await initializeScheduler(io); // Modify initializeScheduler to accept 'io'

    // Use httpServer.listen instead of app.listen
    httpServer.listen(port, () => {
      console.log(`Server (with Socket.IO) is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


