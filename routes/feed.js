const { body } = require('express-validator');

const feedControllers = require('../controller/feed');

const express = require('express');

const router = express.Router();

router.get('/posts', feedControllers.getPosts);

router.post(
    '/post',
    [
        body('title', 'Invalid Title!').trim().isLength({ min: 5 }),
        body('content', 'Invalid Content!').trim().isLength({ min: 5 }),
    ],
    feedControllers.postPost
);

router.get('/post/:postId',feedControllers.getPost);

module.exports = router;
