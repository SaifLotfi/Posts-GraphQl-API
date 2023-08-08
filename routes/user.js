const isAuth = require('../middleware/is-auth');

const express = require('express');

const userController = require('../controller/user');

const { body } = require('express-validator');

const router = express.Router();

router.get('/status',isAuth,userController.getStatus);

router.post('/update-status',isAuth,[body('status').trim().notEmpty()],userController.updateStatus);

module.exports = router;
