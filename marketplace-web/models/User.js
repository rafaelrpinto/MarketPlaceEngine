var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String,
    nickname: String,
    password: String,
    selected_profile: { type: String, enum: ['buyer', 'seller'] },
    signUpDate: {
        type : Date,
        default : Date.now
    },
    admin: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema, 'user');