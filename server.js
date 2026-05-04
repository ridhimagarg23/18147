// http://20.207.122.201/evaluation-service/register

const express = require('express');
const app = express();

app.use(express.json()); 

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