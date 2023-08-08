// const express = require()
const jwt = require('jsonwebtoken');


module.exports = (req,res,next)=>{
    const authToken = req.get('Authorization').split(' ')[1];
    if(!authToken){
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    let decodedToken;
    jwt.verify(authToken,'aVeryStrongSecretOfYourFlavour',(err,decoded)=>{
        if(err){
            err.statusCode = 500;
            throw err;
        }
        decodedToken = decoded;
    });
    if(!decodedToken){
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken._id;
    next();
}