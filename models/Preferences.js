var mongoose = require('mongoose');
var User        = require('../models/User');

var preferencesSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    tags:[String],
    users:[mongoose.Schema.Types.ObjectId]
});
var Preferences = mongoose.model('Preferences',preferencesSchema);
module.exports = Preferences;