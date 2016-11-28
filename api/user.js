var async       = require('async');
var crypto      = require('crypto');
var nodemailer  = require('nodemailer');
var passport    = require('passport');
var User        = require('../models/User');
var Image       = require('../models/Image');
var express     = require('express');
var router      = express.Router();
var moment      = require('moment');
var jwt         = require('jsonwebtoken');
var multer      = require('multer');
var upload      = multer({ dest: './public/uploads/' });
var fs          = require('fs');

function generateToken(user) {
    var payload = {
        iss: 'my.domain.com',
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(7, 'days').unix()
    };
    return jwt.sign(payload, process.env.TOKEN_SECRET);
}
router.get('/checkAuth',function (req,res) {
    User
        .findById(req.query.id)
        .select('-password')
        .exec(function (err,user) {
            if(err || !user){
                console.log(err);
                res.status(500).send({
                    status:500,
                    message:'Internal server error'
                });
            }else{
                return res.status(200).send({
                    user:user,
                    status:200,
                    exception:null,
                    message:'user found'
                });
            }
        });
});

router.post('/login',function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
        if (!user) {
            return res.status(404).send({
                status:404,
                message:"user not found"
            });
        }
        return res.status(201).send({
            token: generateToken(user),
            user:user,
            status:201,
            exception:null,
            message:'New user created'
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
            return res.status(201).send({
                token: generateToken(user),
                user:user,
                status:201,
                exception:null,
                message:'New user created'
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

router.post('/update',function(req,res,next){
    User.findById(req.body.id, function(err, user) {
        if ('password' in req.body) {
            user.password = req.body.password;
        } else {
            user.email = req.body.email;
            user.name = req.body.name;
            user.username = req.body.username;
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

router.post('/updatePicture',upload.single('image'), function (req,res) {
    if(!fs.existsSync('./public/uploads/'+req.body.userId+'/display')){
        fs.mkdirSync('./public/uploads/'+req.body.userId+'/display');
    }
    fs.renameSync('./public/uploads/'+req.file.filename,'./public/uploads/'+req.body.userId+'/display/'+req.file.filename+'_'+req.file.originalname);
    var link = '/uploads/'+req.body.userId+'/display/'+req.file.filename+'_'+req.file.originalname;
    User
        .findById(req.body.userId)
        .exec(function (err,user) {
            if(err){
                return res.status(500).send({
                    status:500,
                    exception:'internal server error',
                    message:'internal server error'
                });
            }else{
                user.picture = link;
                user.save(function (err) {
                    if(err){
                        return res.status(500).send({
                            status:500,
                            exception:'internal server error',
                            message:'internal server error'
                        });
                    }else{
                        return res.status(200).send({
                            status:200,
                            exception:'image saved successfully',
                            message:'Image Saved Successfully',
                            image:'http://localhost:3000/'+link
                        });
                    }
                });
            }
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