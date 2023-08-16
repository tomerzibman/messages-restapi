const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const feedRoutes = require('./routes/feed');

app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
    // set domains (origins) allowed to access our server (* is wildcard; all)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // tells clients (origins) which methods are allowed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    // allow clients to set Content-Typpe and Authorization headers in requests
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

mongoose.connect('mongodb+srv://Tomer:snwtkgIDbTgvjiR2@cluster0.7bkvtlq.mongodb.net/messages?retryWrites=true&w=majority').then(result => {
    app.listen(8080);
}).catch(err => console.log(err));