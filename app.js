const host = 'localhost';
const port = 8080;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const feedRouter = require('./routes/feed.js');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    next();
});

app.use('/feed', feedRouter);

mongoose
    .connect(
        'mongodb+srv://swaifweaa:qGVa7jBPu4hDiNmh@cluster0.waorgrg.mongodb.net/?retryWrites=true&w=majority',
        {
            dbName: 'messages',
        }
    )
    .then((result) => {
        app.listen(port, () => {
            console.log(`Server is running on http://${host}:${port}`);
        });
    }).catch(err=>{
        console.log(err);
    })
