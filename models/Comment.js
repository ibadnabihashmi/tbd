var mongoose    = require('mongoose');
var User        = require('../models/User');

var commentSchema = new mongoose.Schema({
    text:{
        type: String
    },
    createdAt:{
        type : Date,
        default:Date.now()
    },
    image:{
        type: mongoose.Schema.Types.ObjectId
    },
    catalogue:{
        type: mongoose.Schema.Types.ObjectId
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
});

module.exports = mongoose.model('Comment',commentSchema);