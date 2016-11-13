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