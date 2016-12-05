var mongoose    = require('mongoose');
var User        = require('../models/User');
var Catalogue   = require('../models/Catalogue');

var notificationSchema = mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  catalogue:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Catalogue'
  },
  message: String,
  createdAt: Date,
  read: false
});
var Notification = mongoose.model('Notification',notificationSchema);
module.exports = Notification;