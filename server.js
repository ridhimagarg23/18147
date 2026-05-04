// http://20.207.122.201/evaluation-service/register

const express = require('express');
const app = express();
const { Log } = require('./logger');

app.use(express.json()); 

// Custom Middleware for logging requests
app.use((req, res, next) => {
    // Log the incoming request asynchronously
    Log("backend", "info", "express-middleware", `${req.method} ${req.originalUrl}`);
    next();
});

let data = [];

app.get('/users', (req, res) => {
    res.json(data);
});

app.post('/users', (req, res) => {
    const newUser = req.body;
    data.push(newUser);
    res.status(201).json({ message: "User added", data });
});

app.listen(3000, () => {
    console.log("Server running on http://20.207.122.201");
});