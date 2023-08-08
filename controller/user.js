const express = require('express');
const User = require('../models/user');
const { validationResult } = require('express-validator');
exports.getStatus = (req,res,next)=>{
    const userId = req.userId;
    User.findOne({_id:userId}).then(user=>{
        if(!user){
            const error = new Error('No Such User Found!');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            status:user.status,
            message:'Status Fetched Successfully!'
        });
    }).catch(next);
};

exports.updateStatus = (req,res,next)=>{
    const userId = req.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed , Enter Proper Values!');
        error.statusCode = 422;
        error.body = errors.array();
        throw error;
    }
    User.findOne({_id:userId}).then(user=>{
        if(!user){
            const error = new Error('No Such User Found!');
            error.statusCode = 404;
            throw error;
        }
        user.status = req.body.status;
        return user.save();
        
    }).then(user=>{
        res.status(200).json({
            status:user.status,
            message:'Status Fetched Successfully!'
        });
    }).catch(next);
};