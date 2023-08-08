const { body } = require('express-validator');

const feedControllers = require('../controller/feed');

const isAuth = require('../middleware/is-auth');

const express = require('express');

const router = express.Router();

router.get('/posts', isAuth, feedControllers.getPosts);

router.post(
    '/post',
    isAuth,
    [
        body('title', 'Invalid Title!').trim().isLength({ min: 5 }),
        body('content', 'Invalid Content!').trim().isLength({ min: 5 }),
    ],
    feedControllers.postPost
);

router.get('/post/:postId', isAuth, feedControllers.getPost);

router.put(
    '/post/:postId',
    isAuth,
    [
        body('title', 'Invalid Title!').trim().isLength({ min: 5 }),
        body('content', 'Invalid Content!').trim().isLength({ min: 5 }),
    ],
    feedControllers.updatePost
);

router.delete('/post/:postId', isAuth, feedControllers.deletePost);



module.exports = router;
