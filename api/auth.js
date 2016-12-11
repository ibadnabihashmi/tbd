var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var qs = require('querystring');
var User = require('../models/User');
var passport        = require('passport');
var express         = require('express');
var router          = express.Router();

function generateToken(user) {
    var payload = {
        iss: 'my.domain.com',
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(7, 'days').unix()
    };
    return jwt.sign(payload, process.env.TOKEN_SECRET);
}

router.post('/facebook', function (req,res) {
    var profileFields = ['id', 'name', 'email', 'gender', 'location'];
    var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + profileFields.join(',');

    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: process.env.FACEBOOK_SECRET,
        redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
        if (accessToken.error) {
            return res.status(500).send({ msg: accessToken.error.message });
        }

        // Step 2. Retrieve user's profile information.
        request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
            if (profile.error) {
                return res.status(500).send({ msg: profile.error.message });
            }

            // Step 3a. Link accounts if user is authenticated.
            if (req.isAuthenticated()) {
                User.findOne({ facebook: profile.id }, function(err, user) {
                    if (user) {
                        return res.status(409).send({ msg: 'There is already an existing account linked with Facebook that belongs to you.' });
                    }
                    user = req.user;
                    user.name = user.name || profile.name;
                    user.gender = user.gender || profile.gender;
                    user.picture = user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                    user.facebook = profile.id;
                    user.save(function() {
                        res.send({ token: generateToken(user), user: user });
                    });
                });
            } else {
                // Step 3b. Create a new user account or return an existing one.
                User.findOne({ facebook: profile.id }, function(err, user) {
                    if (user) {
                        return res.send({ token: generateToken(user), user: user });
                    }
                    User.findOne({ email: profile.email }, function(err, user) {
                        if (user) {
                            return res.status(400).send({ msg: user.email + ' is already associated with another account.' })
                        }
                        user = new User({
                            name: profile.name,
                            username: profile.username?profile.username:profile.name.split(' ').join(''),
                            email: profile.email,
                            gender: profile.gender,
                            location: profile.location && profile.location.name,
                            socialAuthPic: 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
                            facebook: profile.id
                        });
                        user.save(function(err) {
                            return res.send({ token: generateToken(user), user: user });
                        });
                    });
                });
            }
        });
    });
});

router.get('/facebook/callback', function (req,res) {
    res.send(200);
});

router.get('/google', passport.authenticate('google', 
    { 
        scope: 'profile email' 
    }
));

router.get('/google/callback', passport.authenticate('google', 
    { 
        successRedirect: '/', 
        failureRedirect: '/login' 
    }
));

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback', passport.authenticate('twitter', 
    { 
        successRedirect: '/', 
        failureRedirect: '/login' 
    }
));

module.exports = router;