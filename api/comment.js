var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var Catalogue = require('../models/Catalogue');
var Image = require('../models/Image');
var Comment = require('../models/Comment');
var express = require('express');
var router = express.Router();

router.post('/add',function (req,res) {
    var comment = new Comment({
        text:req.body.text,
        createdAt:Date.now(),
        image:req.body.imageId,
        catalogue:req.body.catalogueId,
        user:req.user.id
    });
    comment.save(function (err) {
        if(!err){
            return res.status(201).send({
                status:201,
                exception:null,
                message:'New Comment Added',
                comment:comment
            });
        }else{
            return res.status(500).send({
                status:500,
                exception:'Internal Server Error',
                message:'Cannot add comment'
            });
        }
    });
});

router.put('/update',function (req,res) {
    Comment
        .findById(req.body.commentId)
        .exec(function (err,comment) {
            if(comment){
                comment.text = req.body.text;
                comment.save(function (err) {
                    if(err){
                        return res.status(500).send({
                            status:500,
                            exception:'Internal server',
                            message:'Cannot update due to Internal Error '+err
                        });
                    }else{
                        return res.status(200).send({
                            status:200,
                            exception:null,
                            message:'updated comment successfully'
                        });
                    }
                });
            }else{
                res.status(404).send({
                    status:404,
                    exception:'Not found',
                    message:'Comment not found'
                });
            }
        })
});

router.get('/getComment',function (req,res) {
    Comment
        .findById(req.body.commentId)
        .exec(function (err,comment) {
            if(comment){
                return res.status(200).send({
                    status:200,
                    exception:null,
                    message:'fetched comment',
                    comment:comment
                });
            }else{
                return res.status(500).send({
                    status:500,
                    exception:'Internal Server Error',
                    message:'New comment added successfully'
                });
            }
        })
});

router.get('/getComments',function (req,res) {
    Comment
        .find({image:req.body.imageId})
        .exec(function (err,comments) {
            if(comment){
                return res.status(200).send({
                    status:200,
                    exception:null,
                    message:'fetched comment',
                    comment:comment
                });
            }else{
                return res.status(500).send({
                    status:500,
                    exception:'Internal Server Error',
                    message:'New comment added successfully'
                });
            }
        });
});

router.delete('/remove',function (req,res) {
    Comment
        .remove({_id:req.body.commentId})
        .exec(function (err) {
            if(err){
                return res.status(404).send({
                    status:404,
                    exception:'Not Found',
                    message:'the comment not found'
                });
            }else{
                return res.status(200).send({
                    status:200,
                    exception:null,
                    message:'Comment deleted successfully'
                });
            }
        })
});

module.exports = router;