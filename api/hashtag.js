var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Hashtag = require('../models/Hashtag');
var express = require('express');
var router = express.Router();

router.post('/',function (req,res) {
    async.each(req.body.hashtags.split(','),function(hashtag,callback){
        Hashtag.findOne({name:hashtag.toLowerCase()})
            .exec(function(err,hashtag){
                if(hashtag.length > 0){
                    hashtag.imagesTagged.push(req.body.imageId);
                    hashtag.save(function(err){
                        if(!err){
                            callback();
                        }else{
                            callback();
                        }
                    });
                }else{
                    var _hashtag = new Hashtag({
                        name:tag
                    });
                    _hashtag.imagesTagged.push(req.body.imageId);
                    _hashtag.save(function(err){
                        if(!err){
                            callback();
                        }else{
                            callback();
                        }
                    });
                }
            });
    },function(err){
        if(err){
            res.status(500).send({
                status:500,
                exception:'Internal Server Error',
                message:'Internal Server Error'
            });
        }else{
            res.status(200).send({
                status:200,
                exception:null,
                message:'tags saved'
            });
        }
    });
});

module.exports = router;