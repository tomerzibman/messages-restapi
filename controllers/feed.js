const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const fileHelper = require('../utils/fileUtils');

exports.getPosts = async (req, res, next) => {
    const curPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find().populate('creator').skip((curPage - 1)*perPage).limit(perPage);
        res.status(200).json({
            message: 'Posts were fetched successfully!',
            posts: posts,
            totalItems: totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
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
    try {
        await post.save();
        const user = await User.findById(userId);
        user.posts.push(post._id);
        await user.save();
        res.status(201).json({
            message: 'Post creared successfully!',
            post: post,
            creator: { _id: user._id, name: user.name }
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error(`Post with id ${postId} not found in database.`);
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({
            message: 'Post was found!',
            post: post
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updatePost = async (req, res, next) => {
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
    try {
        const post = await Post.findById(postId);
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
        const result = await post.save();
        return res.status(200).json({
            message: 'Post updated successfully!',
            post: result
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);
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
        if (post.imageUrl) {
            fileHelper.clearImage(post.imageUrl);
        }
        await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();
        return res.status(200).json({
            message: 'Post deleted successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};