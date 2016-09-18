var mongoose = require('mongoose');
var Image = require('../models/Image');

var hashtagSchema = new mongoose.Schema({
    name : {
        type : String
    },
    imagesTagged : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Image'
        }
    ]
});

var Hashtag = mongoose.model('hashtagSchema',hashtagSchema);
module.exports = Hashtag;