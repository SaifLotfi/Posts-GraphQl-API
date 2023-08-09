const express = require('express');
const fs = require('fs');
const path = require('path');
const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const { emit } = require('process');
exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        let totalPosts = await Post.count();
        console.log(totalPosts);
        const posts = await Post.find()
            .populate('creator')
            .sort({createdAt:-1})
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({
            message: 'Posts Fetched!',
            posts: posts,
            totalItems: totalPosts,
        });
    } catch (err) {
        next(err);
    }
};

exports.postPost = async (req, res, next) => {
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
    try {
        const savedPost = await post.save();
        const user = await User.findById(creatorId);
        if (!user) {
            const error = new Error('User Not Found!');
            error.statusCode = 404;
            throw error;
        }
        let creator = user;
        user.posts.push(savedPost);
        io.getIO().emit('posts',{
            action:'create',
            post:post
        });
        const result = await user.save();
        res.status(201).json({
            message: 'The Post Has Been Created Successfully!',
            post: savedPost,
            creator: {
                creatorId: creator._id,
                name: creator.name,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
        const error = new Error('Post Not Found.');
        error.statusCode = 404;
        throw error;
    }
    return res.status(200).json({
        message: 'Post Fetched!',
        post: post,
    });
};

exports.updatePost = async (req, res, next) => {
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

    try {
        const updatedPost = await Post.findById(postId).populate('creator');
        if (!updatedPost) {
            const error = new Error('No Such Post Found!');
            error.statusCode = 404;
            throw error;
        }
        if (updatedPost.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        if (updatedPost.imageUrl !== imageUrl) {
            deleteFile(updatedPost.imageUrl);
        }
        updatedPost.title = title;
        updatedPost.content = content;
        updatedPost.imageUrl = imageUrl;
        const savedPost = await updatedPost.save();
        io.getIO().emit('posts',{
            action:'update',
            post:savedPost
        });
        return res.status(200).json({
            message: 'Post Updated Correctly!',
            post: savedPost,
        });
    } catch (err) {
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);

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
        const updatedPost = await Post.findOneAndDelete(postId);
        io.getIO().emit('posts',{
            action:'delete',
            post:postId
        });
        console.log(updatedPost);
        return res.status(200).json({
            message: 'Post was deleted Successfully!',
        });
    } catch (err) {
        next(err);
    }
};

const deleteFile = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => {
        console.log(err);
    });
};
