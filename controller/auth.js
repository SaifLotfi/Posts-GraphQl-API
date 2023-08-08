const express = require('express');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
exports.signup = (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                name: name,
                password: hashedPassword,
                email: email,
            });
            return user.save();
        })
        .then((user) => {
            return res.status(200).json({
                message: 'User Created Successfully!',
                id: user._id,
            });
        })
        .catch(next);
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                const error = new Error(
                    'A user with this email cannot be found!'
                );
                error.statusCode = 404;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error = new Error('Wrong Password!');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {email: email, _id: loadedUser._id.toString() },
                'aVeryStrongSecretOfYourFlavour',
                {
                    expiresIn: '1h',
                }
            );
            res.status(200).json({token:token,userId:loadedUser._id.toString()});
        })
        .catch(next);
};
