var express           = require('express');
var path              = require('path');
var logger            = require('morgan');
var compression       = require('compression');
var methodOverride    = require('method-override');
var session           = require('express-session');
var flash             = require('express-flash');
var bodyParser        = require('body-parser');
var expressValidator  = require('express-validator');
var dotenv            = require('dotenv');
var mongoose          = require('mongoose');
var passport          = require('passport');

// Load environment variables from .env file
dotenv.load();

var user              = require('./api/user');
var auth              = require('./api/auth');
var catalogue         = require('./api/catalogue');
var comment           = require('./api/comment');
var hashtag           = require('./api/hashtag');
var image             = require('./api/image');

// Passport OAuth strategies
require('./config/passport');

var app = express();
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(allowCrossDomain);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(methodOverride('_method'));
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/test',function (req,res) {
  res.render('test');
});
app.use('/api/user'       ,user);
app.use('/api/auth'       ,auth);
app.use('/api/hastag'     ,hashtag);
app.use('/api/image'      ,image);
app.use('/api/comment'    ,comment);
app.use('/api/catalogue'  ,catalogue);

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
