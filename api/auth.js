var passport = require('passport');
var express = require('express');
var router = express.Router();

router.get('/facebook', passport.authenticate('facebook',
    { 
        scope: ['email', 'user_location']
    }
));

router.get('/facebook/callback', passport.authenticate('facebook', 
    { 
        successRedirect: '/', 
        failureRedirect: '/login' 
    }
));

router.get('/google', passport.authenticate('google', 
    { 
        scope: 'profile email' 
    }
));

router.get('/google/callback', passport.authenticate('google', 
    { 
        successRedirect: '/', 
        failureRedirect: '/login' 
    }
));

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback', passport.authenticate('twitter', 
    { 
        successRedirect: '/', 
        failureRedirect: '/login' 
    }
));

module.exports = router;