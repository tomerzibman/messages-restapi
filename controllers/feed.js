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
        console.log('Hereherherehr');
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
        creator: { name: 'Tomer' }
    });
    post.save().then(post => {
        res.status(201).json({
            message: 'Post creared successfully!',
            post: post
        });
    }).catch(err => console.log(err));
    res.status(201).json({
        message: "Post created successfully!",
        post: {
            _id: new Date().toISOString(), 
            title: title, 
            content: content, 
            creator: { name: 'Tomer' }, 
            createdAt: new Date()
        }
    });
};