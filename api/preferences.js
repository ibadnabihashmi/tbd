var async       = require('async');
var nodemailer  = require('nodemailer');
var passport    = require('passport');
var Preferences = require('../models/Preferences');
var express     = require('express');
var router      = express.Router();

router.post('/addtag',function (req,res) {
    Preferences
        .findOne({
            userId:req.body.userId
        })
        .exec(function (err,preferences) {
            if(!err && preferences){
                if(preferences.tags.indexOf(req.body.tag) == -1){
                    preferences.tags.push(req.body.tag);
                }
                preferences.save(function (err) {
                    if(!err){
                        return res.status(200).send({
                            status:200,
                            message:'tag saved',
                            exception:null,
                            preferences:preferences
                        });
                    }else{
                        return res.status(500).send({
                            status:500,
                            exception:'Internal server error',
                            message:'Internal server error, couldnt save tag'
                        });
                    }
                });
            }else{
                var _preferences = new Preferences({
                    tags:[],
                    users:[],
                    userId:req.body.userId
                });
                _preferences.tags.push(req.body.tag);
                _preferences.save(function (err) {
                    if(!err){
                        return res.status(200).send({
                            status:200,
                            message:'tag saved',
                            exception:null,
                            preferences:_preferences
                        });
                    }else{
                        return res.status(500).send({
                            status:500,
                            exception:'Internal server error',
                            message:'Internal server error, couldnt save tag'
                        });
                    }
                });
            }
        });
});

module.exports = router;