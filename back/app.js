const express = require('express');
const morgan = require('morgan');
const postRoute = require('./routes/post');
const userRoute = require('./routes/user');
const commentRoute = require('./routes/comment');
const friendRoute = require('./routes/friend');
const messageRoute = require('./routes/message');
const path = require('path');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(morgan('dev'));

app.use('/api/posts', postRoute);
app.use('/api/users', userRoute);
app.use('/api/comments', commentRoute);
app.use('/api/friends', friendRoute);
app.use('/api/messages', messageRoute);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;