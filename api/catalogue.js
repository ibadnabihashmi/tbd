var async       = require('async');
var nodemailer  = require('nodemailer');
var passport    = require('passport');
var User        = require('../models/User');
var Catalogue   = require('../models/Catalogue');
var Image       = require('../models/Image');
var Comment     = require('../models/Comment');
var express     = require('express');
var router      = express.Router();

router.post('/create',function(req,res){
    var catalogue = new Catalogue({
        name:req.body.name,
        description:req.body.description?req.body.description:undefined,
        user:req.body.id,
        updatedAt:Date.now()
    });
    catalogue.save(function(err){
        if(!err){
            return res.status(201).send({
                status:201,
                exception:null,
                message:'new catalogue created',
                catalogue:catalogue
            });
        }else{
            return res.status(500).send({
                status:500,
                exception:'internal server error',
                message:'cannot create catalogue '+err
            });
        }
    });
});

router.get('/get',function (req,res) {
    Catalogue
        .findById(req.query.catalogueId)
        .exec(function (err,catalogue) {
            if(catalogue){
                return res.status(200).send({
                    status:200,
                    exception:null,
                    message:'catalogue retreived',
                    catalogue:catalogue
                })
            }else{
                return res.status(404).send({
                    status:404,
                    exception:'Not Found',
                    message:'Catalogue not found'
                })
            }
        });
});

router.put('/update',function (req,res) {
    Catalogue
        .findById(req.body.catalogueId)
        .exec(function (err,catalogue) {
            if(catalogue){
                catalogue.name = req.body.name;
                catalogue.description = req.body.description;
                catalogue.updatedAt = Date.now()
                catalogue.save(function(err){
                    if(err){
                        return res.status(500).send({
                            status:500,
                            exception:'Internal server',
                            message:'Cannot delete due to Internal Error '+err
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
                return res.status(404).send({
                    status:404,
                    message:'Catalogue not found',
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