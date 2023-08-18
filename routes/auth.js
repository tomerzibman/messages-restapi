const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/signup', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({email: value}).then(user => {
                if (user) {
                    return Promise.reject('E-mail address already exists!');
                }
            });
        }), 
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
], authController.signup);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', isAuth, [ body('status').trim().not().isEmpty() ], authController.updateStatus);

module.exports = router;