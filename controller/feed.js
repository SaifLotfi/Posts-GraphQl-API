const express = require('express');
const Post = require('../models/post');
const {validationResult} = require('express-validator')
exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'First Post',
                content: 'This is the first post!',
                imageUrl: 'images/duck.jpg',
                creator: {
                    name: 'Saif',
                },
                createdAt: new Date(),
            },
        ],
    });
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            message:errors.array()[0].msg,
            errors:errors.array()
        })
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title:title,
        content:content,
        imageUrl:'images/monkey',
        creator:{name:'Saif'}
    });
    post.save().then(post=>{
        res.status(201).json({
        message: 'The Post Has Been Created Successfully!',
        post: post
    });
    }).catch(err=>console.log(err));
    
};
