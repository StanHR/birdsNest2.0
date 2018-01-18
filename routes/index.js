var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/',function(req, res){
	res.redirect('/users/home');
});
router.get('/register',function(req, res){
	res.redirect('/users/home');
});
router.get('/login',function(req, res){
	res.redirect('/users/home');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/home');
	}
}

module.exports = router;