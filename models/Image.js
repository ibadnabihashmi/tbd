var mongoose    = require('mongoose');
var User        = require('../models/User');
var Catalogue   = require('../models/Catalogue');

var imageSchema = new mongoose.Schema({
    caption:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    },
    hashtags:[String],
    source:{
        type:String
    },
    catalogue:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Catalogue'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
});

var Image = mongoose.model('Image',imageSchema);
module.exports = Image;