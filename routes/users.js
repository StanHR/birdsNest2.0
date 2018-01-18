var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.render('index');
	}
}

// Register
router.get('/register', function(req, res){
	res.redirect('home');
});

// Login
router.get('/login', function(req, res){
	res.redirect('home');
});

router.get('/home',ensureAuthenticated,(req,res)=>{
	res.redirect('dashboard');
})

router.get('/dashboard',ensureAuthenticated,(req,res)=>{
	res.render('dashboard');
})

// Register User
router.post('/signup', function(req, res){
	var fname  = req.body.fname;
	var lname = req.body.lname;
	var email = req.body.email;
	var password = req.body.pwd;
	var signupType = req.body.data_source;
	var uniqueInt = Math.floor(Math.random()*9999);

	var newUser = new User({
		userid : fname.toLowerCase()+'.'+lname.toLowerCase()+uniqueInt,
		token : null,
		signupType : signupType,
		email : email,
		name : fname+' '+lname,
		password : password,
		userPicUrl : null,
		lastLogin : null,
		joinDate : Date.now(),
		emailVerified : 0,
	});

	//console.log(newUser);

	User.createUser(email, newUser, function(err, user){
		if(err) throw err;
		console.log(user);
	});

	// res.redirect('/users/home?r='+encodeURIComponent('signup successfu);
	res.redirect('/users/home');
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByEmail(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		console.log("Account Not Found !")
   		return done(null, false, {message: 'Unknown User'});
   	}
   	if(user){
	   	User.comparePassword(password, user.password, function(err, isMatch){
	   		if(err) throw err;
	   		if(isMatch){
	   			console.log("Account Found ! ",user.userid);
       			user.lastLogin = Date.now();
       			user.save((err,res)=>{
       				if(err){
	       				return done(null, false);
       				}
       				if(res){
       					return done(null, user);
       				}
       			})	
	   		} else {
	   			console.log("Wrong Password !")
	   			// return done(null, false, {message: 'Invalid password'});
	   			return done(null, false);
	   		}
	   	});
   }
   });
  }));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'dashboard', failureRedirect:'home',failureFlash: true}),
  function(req, res) {
    res.redirect('/home');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/');
});

module.exports = router;