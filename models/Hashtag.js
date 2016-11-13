var mongoose        = require('mongoose');
var Image           = require('../models/Image');
var Catalogue       = require('../models/Catalogue');

var hashtagSchema = new mongoose.Schema({
    name: {
        type: String
    },
    imagesTagged: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image'
        }
    ],
    cataloguesTagged: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Catalogue'
        }
    ]
});

var Hashtag = mongoose.model('hashtagSchema',hashtagSchema);
module.exports = Hashtag;