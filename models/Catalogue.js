var mongoose    = require('mongoose');
var User        = require('../models/User');

var catalogueSchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    price:{
        type:Number
    },
    hashtags:[String],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    images: {
        type:[String],
        default: []
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    modifiedAt:{
        type:Date
    },
    views: {
        type:Number,
        default:0
    }
});

var Catalogue = mongoose.model('Catalogue',catalogueSchema);
module.exports = Catalogue;