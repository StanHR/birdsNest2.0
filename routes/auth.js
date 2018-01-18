var express = require('express');
var router = express.Router();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user');
var configAuth = require('../config/auth');

router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback', 
    passport.authenticate('facebook', { successRedirect: '/dashboard',
                                          failureRedirect: '/' }));

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback', 
    passport.authenticate('google', { successRedirect: '/dashboard',
                                      failureRedirect: '/' }));

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL
  	},
  	
  	function(accessToken, refreshToken, profile, done) {
    	process.nextTick(function(){
    		User.findOne({'userid': profile.id}, function(err, user){
    			if(err)
    				return done(err);
    			if(user){
                    user.lastLogin = Date.now();
                    user.save((err,res)=>{
                        if(err){
                            return done(null, false);
                        }
                        if(res){
                            return done(null, user);
                        }
                    }); 
                }
    			else {
    				var newUser = new User();
    				newUser.userid = profile.id;
    				newUser.token = accessToken;
                    newUser.signupType = "facebook";
    				newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
    				newUser.email = profile.emails[0].value;
                    newUser.password = null;
                    newUser.userPicUrl = null;
                    newUser.lastLogin = Date.now();
                    newUser.joinDate = Date.now();
                    newUser.emailVerified = 1;
    				newUser.save(function(err){
    					if(err)
    						throw err;
    					return done(null, newUser);
    				})
    				//console.log(profile);
    			}
    		});
    	});
    }

));

passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            User.findOne({'userid': profile.id}, function(err, user){
                if(err)
                    return done(err);
                if(user)
                {
                    user.lastLogin = Date.now();
                    user.save((err,res)=>{
                        if(err){
                            return done(null, false);
                        }
                        if(res){
                            return done(null, user);
                        }
                    });
                }
                else {
                    var newUser = new User();
                    newUser.userid = profile.id;
                    newUser.token = accessToken;
                    newUser.signupType = 'google';
                    newUser.name = profile.displayName;
                    newUser.email = profile.emails[0].value;
                    newUser.password = null;
                    newUser.lastLogin =Date.now();
                    newUser.joinDate = Date.now();
                    newUser.emailVerified = 1;

                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null, newUser);
                    })
                    //console.log(profile);
                }
            });
        });
    }

));



module.exports = router;