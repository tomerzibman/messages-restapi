const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const config = require('../config/config');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const hashed = await bcrypt.hash(password, 12)
        const user = new User({
            email: email,
            password: hashed,
            name: name
        });
        const result = await user.save();
        res.status(201).json({
            message: 'Signed user up sucessfully!',
            userId: result._id
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({email: email})
        if (!user) {
            const error = new Error('User with this email does not exist');
            error.statusCode = 401;
            throw error;
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { 
                email: user.email, 
                userId: user._id.toString() 
            }, 
            config.auth.skey,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            message: 'Logged in user sucessfully!',
            token: token,
            userId: user._id.toString()
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        return res.status(200).json({
            message: 'Satus fetched sucessfully!',
            status: user.status
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.updateStatus = async (req, res, next) => {
    const updatedStatus = req.body.status;
    try {
        const user = await User.findById(req.userId)
        user.status = updatedStatus;
        await user.save();
        return res.status(200).json({
            message: 'Updated status sucessefully!'
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};