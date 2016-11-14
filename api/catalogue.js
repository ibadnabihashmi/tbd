var async       = require('async');
var nodemailer  = require('nodemailer');
var passport    = require('passport');
var User        = require('../models/User');
var Catalogue   = require('../models/Catalogue');
var Image       = require('../models/Image');
var Hashtag     = require('../models/Hashtag');
var Comment     = require('../models/Comment');
var express     = require('express');
var router      = express.Router();
var multer      = require('multer');
var upload      = multer({ dest: './public/uploads/' });
var _           = require('lodash');
var fs          = require('fs');

router.post('/create',upload.array('files'),function(req,res){
    var tags = _.union(
        req.body.image1tags.split(' '),
        req.body.image2tags.split(' '),
        req.body.image3tags.split(' '),
        req.body.image4tags.split(' ')
    );
    var catalogue = new Catalogue({
        name:req.body.catalogueName,
        description:req.body.catalogueDesc?req.body.catalogueDesc:undefined,
        user:req.body.userId,
        price:Number(req.body.cataloguePrice),
        hashtags:tags,
        modifiedAt:Date.now()
    });
    User
        .findById(req.body.userId)
        .exec(function (err,user) {
            if(user && !err){
                catalogue.save(function(err){
                    if(!err){
                        var counter = 1;
                        if(!fs.existsSync('./public/uploads/'+user._id)){
                            fs.mkdirSync('./public/uploads/'+user._id);
                        }
                        fs.mkdirSync('./public/uploads/'+user._id+'/'+req.body.catalogueName);
                        async.eachSeries(req.files,function(file,callback1){
                            fs.renameSync('./public/uploads/'+file.filename,'./public/uploads/'+user._id+'/'+catalogue.name+'/'+file.filename+'_'+file.originalname);
                            var image = new Image({
                                caption:req.body['image'+counter+'caption'],
                                source:'/uploads/'+user._id+'/'+catalogue.name+'/'+file.filename+'_'+file.originalname,
                                updatedAt:Date.now(),
                                catalogue:catalogue._id,
                                user:user._id,
                                hashtags:_.union(req.body['image'+counter+'tags'].split(' '))
                            });
                            counter++;
                            image.save(function (err) {
                                if(!err){
                                    async.eachSeries(image.hashtags,function(hashtag,callback2){
                                        Hashtag
                                            .findOne({
                                                name:hashtag.toLowerCase()
                                            })
                                            .exec(function(err,_hashtag){
                                                if(_hashtag){
                                                    _hashtag.imagesTagged.push(image._id);
                                                    _hashtag.cataloguesTagged.push(catalogue._id);
                                                    _hashtag.save(function(err){
                                                        if(err){
                                                            callback2(err);
                                                        }else{
                                                            callback2();
                                                        }
                                                    });
                                                }else{
                                                    var __hashtag = new Hashtag({
                                                        name:hashtag
                                                    });
                                                    __hashtag.imagesTagged.push(image._id);
                                                    __hashtag.cataloguesTagged.push(catalogue._id);
                                                    __hashtag.save(function(err){
                                                        if(err){
                                                            callback2(err);
                                                        }else{
                                                            callback2();
                                                        }
                                                    });
                                                }
                                            });
                                    },function (err) {
                                        if(err){
                                            callback1(err)
                                        }else{
                                            callback1();
                                        }
                                    });
                                }else{
                                    callback1(err)
                                }
                            });
                        },function (err) {
                            if(err){
                                return res.status(500).send({
                                    status:500,
                                    exception:err,
                                    message:'cannot create catalogue '+err
                                });
                            }else{
                                return res.status(200).send({
                                    status:200,
                                    exception:null,
                                    message:'Catalogue created',
                                    catalogueId:catalogue._id
                                });
                            }
                        });
                    }else{
                        return res.status(500).send({
                            status:500,
                            exception:err,
                            message:'cannot create catalogue '+err
                        });
                    }
                });
            }else{
                return res.status(500).send({
                    status:500,
                    exception:err,
                    message:'cannot create catalogue '+err
                });
            }
        });

});



router.get('/get/:catalogueId',function (req,res) {
    Catalogue
        .findById(req.params.catalogueId)
        .exec(function (err,catalogue) {
            if(!err && catalogue){
                Image
                    .find({ catalogue:catalogue._id })
                    .exec(function (err,images) {
                        if(!err && images.length > 0){
                            return res.status(200).send({
                                status:200,
                                exception:null,
                                message:'catalogue retreived',
                                catalogue:catalogue,
                                images:images
                            });
                        }else{
                            return res.status(200).send({
                                status:200,
                                exception:null,
                                message:'catalogue retreived',
                                catalogue:catalogue,
                                images:[]
                            });
                        }
                    });
            }else{
                return res.status(404).send({
                    status:404,
                    exception:'Not Found',
                    message:'Catalogue not found'
                })
            }
        });
});

router.post('/update',upload.array('files'),function (req,res) {
    User
        .findById(req.body.userId)
        .exec(function (err,user) {
            if(user && !err){
                Catalogue
                    .findById(req.body.catId)
                    .exec(function (err,catalogue) {
                        if(catalogue){
                            fs.renameSync('./public/uploads/'+user._id+'/'+catalogue.name,'./public/uploads/'+user._id+'/'+req.body.catName);
                            catalogue.name = req.body.catName;
                            catalogue.description = req.body.catDesc;
                            catalogue.updatedAt = Date.now();
                            catalogue.price = req.body.catPrice;
                            Image
                                .find({
                                    '$and':[
                                        {
                                            catalogue:catalogue._id
                                        },
                                        {
                                            user:user._id
                                        }
                                    ]
                                })
                                .exec(function (err,images) {
                                    if(images.length > 0 && !err){
                                        async.eachSeries(images,function (image ,callback) {
                                            var srcLength = image.source.split('/').length;
                                            image.source = '/uploads/'+user._id+'/'+req.body.catName + '/' + image.source.split('/')[srcLength-1];
                                            image.save(function (err) {
                                                if(!err){
                                                    callback();
                                                }else{
                                                    callback(err);
                                                }
                                            });
                                        },function (err) {
                                            if(!err){
                                                catalogue.save(function(err){
                                                    if(err){
                                                        return res.status(500).send({
                                                            status:500,
                                                            exception:'Internal server',
                                                            message:'Cannot update catalogue due to Internal Error '+err
                                                        });
                                                    }else{
                                                        return res.status(200).send({
                                                            status:200,
                                                            exception:null,
                                                            message:'updated catalogue successfully'
                                                        });
                                                    }
                                                });
                                            }else{
                                                return res.status(500).send({
                                                    status:500,
                                                    exception:'Internal server',
                                                    message:'Cannot update catalogue due to Internal Error '+err
                                                });
                                            }
                                        })
                                    }else{
                                        catalogue.save(function(err){
                                            if(err){
                                                return res.status(500).send({
                                                    status:500,
                                                    exception:'Internal server',
                                                    message:'Cannot update catalogue due to Internal Error '+err
                                                });
                                            }else{
                                                return res.status(200).send({
                                                    status:200,
                                                    exception:null,
                                                    message:'updated catalogue successfully'
                                                });
                                            }
                                        });
                                    }
                                });

                        }else{
                            return res.status(404).send({
                                status:404,
                                message:'Catalogue not found',
                                exception:'Not Found'
                            });
                        }
                    });
            }else{
                return res.status(404).send({
                    status:404,
                    message:'User not found',
                    exception:'Not Found'
                });
            }
        });
});

router.delete('/remove',function (req,res) {
    Catalogue
        .remove({_id:req.body.catalogueId})
        .exec(function (err) {
            if(err){
                return res.status(500).send({
                    status:500,
                    exception:'Internal server',
                    message:'Cannot delete due to Internal Error '+err
                });
            }else{
                Image
                    .remove({catalogue:req.body.catalogueId})
                    .exec(function (err) {
                        Comment
                            .remove({catalogue:req.body.catalogueId})
                            .exec(function (err) {
                                return res.status(200).send({
                                    status:200,
                                    exception:null,
                                    message:'Catalogue and associated content deleted successfully'
                                });
                            });
                    });
            }
        })
});

router.get('/fetchUserCatalogues',function (req,res) {
    Catalogue
        .find({
            user:req.query.userId
        })
        .sort({
            createdAt:-1
        })
        .exec(function (err,catalogues) {
            if(err || !catalogues){
                return res.status(404).send({
                    status:404,
                    exception:'nothiong found',
                    message:'No catalogues found'
                });
            }else{
                return res.status(200).send({
                    status:200,
                    exception:null,
                    message:'Catalogues found',
                    catalogues:catalogues
                });
            }
        });
});

module.exports = router;