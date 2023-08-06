const express = require('express');
const Post = require('../models/post');
const { validationResult } = require('express-validator');
exports.getPosts = (req, res, next) => {
    Post.find().then(posts=>{
        res.status(200).json({
            message:'Posts Fetched!',
            posts:posts
        });
    }).catch(next);
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed , Enter Proper Values!');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/monkey.jpg',
        creator: { name: 'Saif' },
    });
    post.save()
        .then((post) => {
            res.status(201).json({
                message: 'The Post Has Been Created Successfully!',
                post: post,
            });
        })
        .catch((err) => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getPost = (req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId).then(post=>{
        if(!post){
            const error = new Error('Post Not Found.');
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({
            message:'Post Fetched!',
            post:post
        });
    }).catch(next);
}