const express = require('express');

const app = express();
const port = 3000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Middleware to parse JSON
app.use(express.json());

// Example route
app.get('/posts', (req, res) => {
    resizeTo.json(posts)
});

app.get('/login', (req, res) => {
    //Authentication logic here
    const username = req.body.username;
    const password = req.body.password;
    const user ={ name : username, password: password}
    const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});