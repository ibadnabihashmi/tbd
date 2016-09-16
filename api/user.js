var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var express = require('express');
var router = express.Router();

router.post('/login',function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
        if (!user) {
            return res.status(404).send({
                status:404,
                message:"user not found"
            });
        }
        req.logIn(user, function(err) {
            return res.status(200).send({
                status:200,
                message:"logged in"
            });
        });
    })(req, res, next);
});

router.post('/signup',function(req, res, next){
    User.findOne({ email: req.body.email }, function(err, user) {
        if (user) {
            return res.status(400).send({
                status:400,
                exception:'Bad Request',
                message:'Not allowed , the user already exist'
            });
        }
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        user.save(function(err) {
            if(err){
                return res.status(500).send({
                    status:500,
                    exception:'Internal server error',
                    message:'Internal server error'
                });
            }
            req.logIn(user, function(err) {
                return res.status(201).send({
                    status:201,
                    exception:null,
                    message:'New user created'
                });
            });
        });
    });
});

router.get('/logout',function(req,res){
    req.logout();
    return res.status(200).send({
        status:200,
        exception:null,
        message:'logged out successfully'
    });
});

router.put('/update',function(req,res,next){
    User.findById(req.user.id, function(err, user) {
        if ('password' in req.body) {
            user.password = req.body.password;
        } else {
            user.email = req.body.email;
            user.name = req.body.name;
            user.gender = req.body.gender;
            user.location = req.body.location;
            user.website = req.body.website;
        }
        user.save(function(err) {
            if(err){
                return res.status(500).send({
                    status:500,
                    exception:'Internal server error',
                    message:'Internal server error'
                });
            }
            return res.status(200).send({
                status:200,
                exception:null,
                message:'User info updated'
            });
        });
    });
});

router.get('/unlink/:provider',function (req,res,next) {
    User.findById(req.user.id, function(err, user) {
        switch (req.params.provider) {
            case 'facebook':
                user.facebook = undefined;
                break;
            case 'google':
                user.google = undefined;
                break;
            case 'twitter':
                user.twitter = undefined;
                break;
            case 'vk':
                user.vk = undefined;
                break;
            case 'github':
                user.github = undefined;
                break;
            default:
                return res.status(400).send({
                    status:400,
                    exception:'Bad Request',
                    message:'Bad Request'
                });
        }
        user.save(function(err) {
            return res.status(200).send({
                status:200,
                exception:'User updated',
                message:'User updated'
            });
        });
    });
});

module.exports = router;