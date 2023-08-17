const jwt = require('jsonwebtoken');

const config = require('../config/config');

module.exports = (req, res, next) => {
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, config.auth.skey);
    } catch(err) {
        err.satusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated, unable to verify');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};