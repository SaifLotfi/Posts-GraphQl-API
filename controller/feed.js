const express = require('express');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const { validationResult } = require('express-validator');
exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalPosts;
    Post.count()
        .then((totalPosts) => {
            totalPosts = totalPosts;
            console.log(totalPosts);
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then((posts) => {
            res.status(200).json({
                message: 'Posts Fetched!',
                posts: posts,
                totalItems: totalPosts,
            });
        })
        .catch(next);
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed , Enter Proper Values!');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No Image Was Sent!');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    console.log(req.file);
    const imageUrl = req.file.path.replace('\\', '/');
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    const creatorId = req.userId;
    let creator;
    post.save()
        .then((post) => {
            User.findById(creatorId)
                .then((user) => {
                    if (!user) {
                        const error = new Error('User Not Found!');
                        error.statusCode = 404;
                        throw error;
                    }
                    creator = user;
                    user.posts.push(post);
                    return user.save();
                })
                .then((result) => {
                    res.status(201).json({
                        message: 'The Post Has Been Created Successfully!',
                        post: post,
                        creator: {
                            creatorId: creator._id,
                            creatorName: creator.name,
                        },
                    });
                })
                .catch(next);
        })
        .catch(next);
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Post Not Found.');
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                message: 'Post Fetched!',
                post: post,
            });
        })
        .catch(next);
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed , Enter Proper Values!');
        error.statusCode = 422;
        throw error;
    }
    console.log(req.body);
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace('\\', '/');
    }
    if (!imageUrl) {
        const error = new Error('No Image was provided!');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('No Such Post Found!');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            if (post.imageUrl !== imageUrl) {
                deleteFile(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then((post) => { 
            return res.status(200).json({
                message: 'Post Updated Correctly!',
                post: post,
            });
        })
        .catch(next);
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('No Such Post Found!');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }
            deleteFile(post.imageUrl);
            return Post.findOneAndDelete(postId);
        })
        .then((result) => {
            console.log(result);
            return res.status(200).json({
                message: 'Post was deleted Successfully!',
            });
        })
        .catch(next);

};


const deleteFile = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => {
        console.log(err);
    });
};
