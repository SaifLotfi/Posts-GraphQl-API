const express = require('express');

const { body } = require('express-validator');

const User = require('../models/user');

const router = express.Router();

const authController = require('../controller/auth');

router.put('/signup', [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email!')
        .custom((val, { req }) => {
            User.find({ email: email })
                .then((user) => {
                    if (user) {
                        return Promise.reject('This Email is Already Taken!');
                    }
                })
                .catch(next);
        })
        .normalizeEmail(),
    body('name').trim().notEmpty(),
    body('password').trim().isLength({ min: 5 }),
],authController.signup);

module.exports = router;
