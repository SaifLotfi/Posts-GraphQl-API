const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs')
module.exports = {
    createUser: async function ({ userInput }, req) {
        //validations
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'E-Mail is invalid.' });
        }
        if (
            validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })
        ) {
            errors.push({ message: 'Password too short!' });
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input.');
            error.data = errors;
            error.statusCode = 422;
            console.log(error);
            throw error;
        }

        const email = userInput.email;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            throw new Error('User is already Exist!');
        }
        const password = userInput.password;
        const name = userInput.name;
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            name: name,
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };
    },
    login: async function ({ email, password }, req) {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('No Such user with this email!');
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Password is incorrect');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            'secretandsomeothersecret',
            { expiresIn: '1h' }
        );
        return { token: token, userId: user._id.toString() };
    },
    createPost: async function (args, req) {
        console.log(args);
        const { title, imageUrl, content } = args.postInput;
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!');
            error.statusCode = 401;
            throw error;
        }
        //validations
        const errors = [];
        if (
            validator.isEmpty(title) ||
            !validator.isLength(title, { min: 5 })
        ) {
            console.log('goodMan');
            errors.push({ message: 'Enter a Valid title!' });
        }
        if (
            validator.isEmpty(content) ||
            !validator.isLength(content, { min: 5 })
        ) {
            errors.push({ message: 'Enter a Valid content!' });
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input.');
            error.data = errors;
            error.statusCode = 422;
            console.log(error);
            throw error;
        }
        ///////////////////////

        let user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('Invalid user.');
            error.code = 401;
            throw error;
        }

        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: user,
        });

        const savedPost = await post.save();
        user.posts.push(savedPost);
        user = await user.save();
        return {
            ...savedPost._doc,
            _id: savedPost._id.toString(),
            createdAt: savedPost.createdAt.toISOString(),
            updatedAt: savedPost.updatedAt.toISOString(),
        };
    },
    posts: async function ({ page }, req) {
        const currentPage = page || 1;
        const perPage = 2;
        try {
            let totalPosts = await Post.count();
            const posts = await Post.find()
                .populate('creator')
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
            const editedPosts = posts.map((p) => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString(),
                };
            });
            return { posts: editedPosts, totalPosts };
        } catch (err) {
            next(err);
        }
    },
    post: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!');
            error.statusCode = 401;
            throw error;
        }
        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error('Post Not Found.');
            error.statusCode = 404;
            throw error;
        }
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        };
    },
    updatePost: async function ({ id, postInput }, req) {
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!');
            error.statusCode = 401;
            throw error;
        }
        const { title, content, imageUrl } = postInput;

        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error('No Such Post Found!');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        const errors = [];
        if (
            validator.isEmpty(title) ||
            !validator.isLength(title, { min: 5 })
        ) {
            console.log('goodMan');
            errors.push({ message: 'Enter a Valid title!' });
        }
        if (
            validator.isEmpty(content) ||
            !validator.isLength(content, { min: 5 })
        ) {
            errors.push({ message: 'Enter a Valid content!' });
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input.');
            error.data = errors;
            error.statusCode = 422;
            console.log(error);
            throw error;
        }

        post.title = title;
        post.content = content;
        if (imageUrl !== 'undefined') {
            post.imageUrl = imageUrl;
        }
        const updatedPost = await post.save();
        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString(),
        };
    },
    deletePost: async function({id},req){
        console.log('deleting');
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!');
            error.statusCode = 401;
            throw error;
        }
        console.log(typeof req.userId);
        const post = await Post.findById(id);
        console.log(post.imageUrl);

        if (!post) {
            const error = new Error('No Such Post Found!');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        deleteFile(post.imageUrl);
        const deletedPost = await Post.findOneAndDelete(id);
        return true;
        // return res.status(200).json({
        //     message: 'Post was deleted Successfully!',
        // });
    },
    user: async function(args,req){
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!');
            error.statusCode = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User Not Found.');
            error.statusCode = 404;
            throw error;
        }
        return {
            ...user._doc,
            _id: user._id.toString(),
        };
    },
    updateStatus: async function({status},req){
        if (!req.isAuth) {
            const error = new Error('Not Authenticated!');
            error.statusCode = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User Not Found.');
            error.statusCode = 404;
            throw error;
        }
        user.status = status;
        const savedUser = await user.save();
        return {
            ...savedUser._doc,
            _id: savedUser._id.toString(),
        };
    }
};


const deleteFile = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => {
        console.log(err);
    });
};

