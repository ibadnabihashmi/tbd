var async       = require('async');
var crypto      = require('crypto');
var nodemailer  = require('nodemailer');
var passport    = require('passport');
var User        = require('../models/User');
var Image       = require('../models/Image');
var Catalogue   = require('../models/Catalogue');
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
        }else{
            User
                .findOne({
                    username:req.body.username
                })
                .exec(function (err,usr) {
                    if(usr){
                        return res.status(400).send({
                            status:400,
                            exception:'Bad Request',
                            message:'Not allowed , username already exist'
                        });
                    }else{
                        user = new User({
                            name: req.body.name,
                            username: req.body.username,
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
                    }
                });
        }
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
                    message:'Internal server error',
                    user:user
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
    if(!fs.existsSync('./public/uploads/'+req.body.userId)){
        fs.mkdirSync('./public/uploads/'+req.body.userId);
        fs.mkdirSync('./public/uploads/'+req.body.userId+'/display');
    }else{
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

router.post('/follow',function(req, res){
    async.parallel([
        function(cb){ User.findByIdAndUpdate(req.body.user1, { $addToSet: {following: req.body.user2}}).exec(cb)},
        function(cb){ User.findByIdAndUpdate(req.body.user2, { $addToSet: {followers: req.body.user1}}).exec(cb)}
    ], function(err){
        if(err){
            return res.status(500).send({
                status:500,
                exception:err,
                message:'Internal server error'
            });
        }else{
            return res.status(200).send({
                status:200,
                exception:null,
                message:'you followed'
            });
        }
    });
});

router.post('/unfollow',function(req, res){
    async.parallel([
        function(cb){ User.findByIdAndUpdate(req.body.user1, { $pull: {following: req.body.user2}}).exec(cb)},
        function(cb){ User.findByIdAndUpdate(req.body.user2, { $pull: {followers: req.body.user1}}).exec(cb)}
    ], function(err, result){
        if(err){
            return res.status(500).send({
                status:500,
                exception:err,
                message:'Internal server error'
            });
        }else{
            return res.status(200).send({
                status:200,
                exception:null,
                message:'you unfollowed'
            });
        }
    });
});

router.post('/setUsername',function (req,res) {
    User
        .findOne({
            username:req.body.username
        })
        .exec(function (err,usr) {
            if(usr){
                return res.status(400).send({
                    status:400,
                    exception:err,
                    message: 'username already present',
                    user: null
                });
            }else{
                User
                    .findById(req.body.userId)
                    .exec(function (err,user) {
                        if(!err && user){
                            user.username = req.body.username;
                            user.save(function (err) {
                                if(!err){
                                    return res.status(200).send({
                                        status:200,
                                        exception:null,
                                        message: 'username has been set successfully',
                                        user: user
                                    });
                                }else{
                                    return res.status(500).send({
                                        status:500,
                                        exception:err,
                                        message: 'username has not been set successfully',
                                        user: user
                                    });
                                }
                            });
                        }else{
                            return res.status(500).send({
                                status:500,
                                exception:err,
                                message: 'username has not been set successfully',
                                user: user
                            });
                        }
                    });
            }
        });
});

router.get('/fetchFeed',function (req, res) {
    // var from = new Date(Number(req.query.from)).toISOString();
    // var to = new Date(Number(req.query.to)).toISOString();
    var from = Number(req.query.from);
    var to = Number(req.query.to);
    var fetchFeed = function (fromTime,toTime) {
        User
          .findById(req.query.userId)
          .exec(function (err,user) {
              if(!err && user){
                  var query = {
                      $and:[
                          {
                              modifiedAt: {
                                  $lte: new Date(fromTime),
                                  $gte: new Date(toTime)
                              }
                          },
                          {
                              user: {
                                  $in:user.following
                              }
                          }
                      ]
                  };
                  Catalogue
                    .find(query)
                    .populate('user')
                    .exec(function (err,catalogues) {
                        if(!err && catalogues.length === 0){//1080000000

                            if(from - toTime >= 1080000000){
                                return res.status(404).send({
                                    status:404,
                                    exception:err?err:null,
                                    message:err?'Internal Server Error':'Nothing found',
                                    catalogues:[]
                                });
                            }else{
                                fetchFeed(toTime,toTime - 36000000);
                            }
                        }else if(!err && catalogues.length > 0){
                            return res.status(200).send({
                                status:200,
                                exception:null,
                                message:'Activity found',
                                catalogues:catalogues,
                                from:toTime,
                                to:toTime - 36000000
                            });
                        }else{
                            return res.status(404).send({
                                status:404,
                                exception:err?err:null,
                                message:err?'Internal Server Error':'Nothing found',
                                catalogues:[]
                            });
                        }
                    });
              }else{
                  return res.status(404).send({
                      status:404,
                      exception:err?err:null,
                      message:err?'Internal Server Error':'Nothing found',
                      catalogues:[]
                  });
              }
          });
    };
    fetchFeed(from,to);
});

module.exports = router;