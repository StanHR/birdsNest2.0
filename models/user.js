var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	userid : {
		type : String,
		required : true,
		unique : true
	},
	token : {
		type : String
	},
	signupType : {
		type : String,
		required : true
	},
	name : {
		type : String,
		required : true
	},
	email : {
		type : String,
		required : true,
		unique : true
	},
	password : {
		type : String
	},
	userPicUrl : {
		type : String
	},
	lastLogin : {
		type : Date
	},
	joinDate : {
		type : Date,
		required : true
	},
	emailVerified : {
		type : Boolean
	}

});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = (newUser, callback)=>{
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, (err, hash)=>{
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByEmail = (email, callback)=>{
	var query = {email};
	User.findOne(query, callback);
}

module.exports.getUserById = (id, callback)=>{
	User.findById(id, callback);
}

module.exports.comparePassword = (candidatePassword, hash, callback)=>{
	bcrypt.compare(candidatePassword, hash, (err, isMatch)=>{
    	if(err){
    		throw err;
    	};
    	if(!isMatch)
    		callback(err,false);
    	if(isMatch){
	    	callback(null, isMatch);
    	}
	});
}