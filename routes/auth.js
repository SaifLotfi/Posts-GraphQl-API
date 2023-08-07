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
            return User.findOne({ email: val })
                .then((user) => {
                    if (user) {
                        return Promise.reject('This Email is Already Taken!');
                    }
                })
                .catch(err=>{
                    console.log(err);
                });
        })
        .normalizeEmail(),
    body('name').trim().notEmpty(),
    body('password').trim().isLength({ min: 5 }),
],authController.signup);

router.post('/login',authController.login);

module.exports = router;
