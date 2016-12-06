var mongoose = require('mongoose');
var User        = require('../models/User');

var preferencesSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    tags:[String]
});
var Preferences = mongoose.model('Preferences',preferencesSchema);
module.exports = Preferences;