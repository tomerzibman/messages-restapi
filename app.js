const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const config = require('./config/config');
const feedRoutes = require('./routes/feed');

const app = express();

app.use(bodyParser.json()); // application/json
app.use('/images', express.static(path.join(__dirname, 'images')));

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
mongoose.connect(config.database.uri).then(result => {
    app.listen(config.server.port);
}).catch(err => console.log(err));