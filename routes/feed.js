const feedControllers = require('../controller/feed');

const express = require('express');

const router = express.Router();

router.get('/posts',feedControllers.getPosts);

router.post('/post',feedControllers.postPost);

module.exports = router;


