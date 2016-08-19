var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String,
    name: String,
    password: String,
    signUpDate: {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('User', userSchema, 'user');