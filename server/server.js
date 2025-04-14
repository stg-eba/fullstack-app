const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4000', // React app URL
  credentials: true,              //  allow credentials (cookies) to be sent
}));
app.use(cookieParser());

// In-memory data store (replace with a database in production)
const users = [
  { id: 1, username: 'admin', password: 'password123' }
];

let todos = [
  { id: 1, userId: 1, title: 'Learn Express', completed: false },
  { id: 2, userId: 1, title: 'Implement JWT Auth', completed: false }
];

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate token
  const userForToken = { id: user.id, username: user.username };
  const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  
  // Set token as HttpOnly cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  
  res.json({ message: 'Login successful', username: user.username });
});

// CRUD operations for todos

// GET all todos for authenticated user
app.get('/todos', authenticateToken, (req, res) => {
  const userTodos = todos.filter(todo => todo.userId === req.user.id);
  res.json(userTodos);
});

// GET a specific todo
app.get('/todos/:id', authenticateToken, (req, res) => {
  const todoId = parseInt(req.params.id);
  const todo = todos.find(t => t.id === todoId && t.userId === req.user.id);
  
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  
  res.json(todo);
});

// CREATE a new todo
app.post('/todos', authenticateToken, (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  // Generate new ID (in a real app, use a better ID generation strategy)
  const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
  
  const newTodo = {
    id: newId,
    userId: req.user.id,
    title,
    completed: false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// UPDATE a todo
app.put('/todos/:id', authenticateToken, (req, res) => {
  const todoId = parseInt(req.params.id);
  const { title, completed } = req.body;
  
  const todoIndex = todos.findIndex(t => t.id === todoId && t.userId === req.user.id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  
  // Update only the fields that were provided
  if (title !== undefined) todos[todoIndex].title = title;
  if (completed !== undefined) todos[todoIndex].completed = completed;
  
  res.json(todos[todoIndex]);
});

// DELETE a todo
app.delete('/todos/:id', authenticateToken, (req, res) => {
  const todoId = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === todoId && t.userId === req.user.id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  
  const deletedTodo = todos[todoIndex];
  todos = todos.filter(t => !(t.id === todoId && t.userId === req.user.id));
  
  res.json({ message: 'Todo deleted successfully', deletedTodo });
});
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});