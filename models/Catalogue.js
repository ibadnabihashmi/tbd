var mongoose    = require('mongoose');
var User        = require('../models/User');

var catalogueSchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    modifiedAt:{
        type:Date
    }
});

var Catalogue = mongoose.model('Catalogue',catalogueSchema);
module.exports = Catalogue;