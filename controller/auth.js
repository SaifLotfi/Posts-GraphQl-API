const express = require('express');
const { validationResult } = require('express-validator');

exports.signup = (req,res,next)=>{
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;   
    }
}