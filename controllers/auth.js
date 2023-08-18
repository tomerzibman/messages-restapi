const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const config = require('../config/config');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 12).then(hashed => {
        const user = new User({
            email: email,
            password: hashed,
            name: name
        });
        return user.save();
    }).then(result => {
        res.status(201).json({
            message: 'Signed user up sucessfully!',
            userId: result._id
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let foundUser;
    User.findOne({email: email}).then(user => {
        if (!user) {
            const error = new Error('User with this email does not exist');
            error.statusCode = 401;
            throw error;
        }
        foundUser = user;
        return bcrypt.compare(password, user.password);
    }).then(match => {
        if (!match) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { 
                email: foundUser.email, 
                userId: foundUser._id.toString() 
            }, 
            config.auth.skey,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            message: 'Logged in user sucessfully!',
            token: token,
            userId: foundUser._id.toString()
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.getStatus = (req, res, next) => {
    User.findById(req.userId).then(user => {
        return res.status(200).json({
            message: 'Satus fetched sucessfully!',
            status: user.status
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.updateStatus = (req, res, next) => {
    const updatedStatus = req.body.status;
    User.findById(req.userId).then(user => {
        user.status = updatedStatus;
        return user.save();
    }).then(() => {
        return res.status(200).json({
            message: 'Updated status sucessefully!'
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};