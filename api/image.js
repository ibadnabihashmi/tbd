var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Image = require('../models/Image');
var Comment = require('../models/Comment');
var express = require('express');
var router = express.Router();

router.post('/saveImage',function (req,res) {
    var link;
    var image = new Image({
        caption:req.body.caption,
        source:link,
        updatedAt:Date.now(),
        catalogue:req.body.catalogueId,
        user:req.user.id,
        hashtags:req.body.hashtags.split(',')
    });
    image.save(function (err) {
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
                message:'Image Saved Successfully'
            });
        }
    })
});

router.get('/getImage',function (req,res) {
    Image
        .findById(req.body.imageId)
        .exec(function (err,image) {
            if(image){
                return res.status(200).send({
                    status:200,
                    exception:null,
                    message:'image retreived successfully'
                });
            }else{
                return res.status(404).send({
                    status:404,
                    exception:'not found',
                    message:'Image not found'
                });
            }
        })

});

router.get('/getCatalogueImages',function (req,res) {
    Image
        .find({catalogue:req.body.catalogueId})
        .exec(function (err,images) {
            if(images.length > 0){
                return res.status(200).send({
                    status:200,
                    exception:null,
                    message:'sending images',
                    images:images
                });
            }else{
                return res.status(404).send({
                    status:404,
                    exception:'Not Found',
                    message:'images not found'
                });
            }
        })
});

router.put('/update',function (req,res) {
    Image
        .findById(req.body.imageId)
        .exec(function (err,image) {
            if(image){
                image.caption = req.body.caption;
                image.hashtags = req.body.hashtags.split(',');
                image.updatedAt = Date.now();
                image.save(function (err) {
                    if(err){
                        return res.status(500).send({
                            status:500,
                            exception:'Internal server error',
                            message:'Internal Server'
                        });
                    }else{
                        return res.status(200).send({
                            status:200,
                            exception:null,
                            message:'info updated'
                        });
                    }
                });
            }else{
                return res.status(404).send({
                    status:404,
                    exception:'Not Found',
                    message:'Image Not found',
                    image:image
                });
            }
        });
});

router.delete('/remove',function (req,res) {
    Image
        .remove({_id:req.body.imageId})
        .exec(function (err) {
            if(err){
                return res.status(500).send({
                    status:500,
                    exception:'Interbal server error',
                    message:'Internal server error '+err
                });
            }else{
                Comment
                    .remove({image:req.body.imageId})
                    .exec(function (err) {
                        return res.status(200).send({
                            status:200,
                            exception:null,
                            message:'Data deleted successfully'
                        });
                    });
            }
        });
});

module.exports = router;