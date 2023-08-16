const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1', 
                title: 'First post', 
                contnet: 'Dummy data', 
                imageUrl: 'images/bookb.png', 
                creator: {
                    name: 'Tomer'
                }, 
                createdAt: new Date()
            }
        ]
    });
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect',
            errors: errors.array()
        });
    }
    
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: 'images/bookb.png',
        creator: { name: 'Tomer' }
    });
    post.save().then(post => {
        res.status(201).json({
            message: 'Post creared successfully!',
            post: post
        });
    }).catch(err => console.log(err));
};