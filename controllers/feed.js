const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../utils/fileUtils');

exports.getPosts = (req, res, next) => {
    const curPage = req.query.page || 1;
    const perPage = 2;
    let totalItems = 0;
    Post.find().countDocuments().then(total => {
        totalItems = total;
        return Post.find().skip((curPage - 1)*perPage).limit(perPage);
    }).then(posts => {
        res.status(200).json({
            message: 'Posts were fetched successfully!',
            posts: posts,
            totalItems: totalItems
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    let creator;
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const userId = req.userId;
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: imageUrl,
        creator: userId
    });
    post.save().then(post => {
        return User.findById(userId);
    }).then(user => {
        creator = user;
        user.posts.push(post._id);
        return user.save();
    }).then(result => {
        res.status(201).json({
            message: 'Post creared successfully!',
            post: post,
            creator: { _id: creator._id, name: creator.name }
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        if (!post) {
            const error = new Error(`Post with id ${postId} not found in database.`);
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({
            message: 'Post was found!',
            post: post
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked!');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    Post.findById(postId).then(post => {
        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }

        if (imageUrl !== post.imageUrl) {
            fileHelper.clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    }).then(result => {
        return res.status(200).json({
            message: 'Post updated successfully!',
            post: result
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        if (!post) {
            const error = new Error('Deleting post that does not exist');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        // Checked logged in user
        if (post.imageUrl) {
            fileHelper.clearImage(post.imageUrl);
        }
        return Post.findByIdAndRemove(postId);
    }).then(result => {
        return User.findById(req.userId);
    }).then(user => {
        user.posts.pull(postId);
        return user.save();
    }).then(result => {
        return res.status(200).json({
            message: 'Post deleted successfully!'
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};