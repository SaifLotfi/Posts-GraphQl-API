// const express = require()
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log('Reached Auth');
    const authToken = req.get('Authorization').split(' ')[1];
    if (!authToken) {
    console.log('NO token');
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    jwt.verify(authToken, 'secretandsomeothersecret', (err, decoded) => {
        if (err) {
            req.isAuth = false;
            console.log('tech err');
            return next();
        }
        decodedToken = decoded;
    });
    if (!decodedToken) {
    console.log('not the same token');
        req.isAuth = false;
        return next();
    }
    req.userId = decodedToken.userId;
    req.isAuth = true;
    console.log('A ok');
    next();
};
