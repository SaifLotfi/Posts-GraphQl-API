const express = require('express');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        title: 'First Post',
        content: 'This is my First Post!',
    });
};

exports.postPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    res.status(201).json({
        message: 'The Post Has Been Created Successfully!',
        post: {
            id:Date.now().toString(),
            title: title,
            content: content,
        },
    });
};
