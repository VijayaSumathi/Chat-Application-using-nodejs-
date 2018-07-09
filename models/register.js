var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
    name:{type:String,unique: true},    
    password: String,   
    email:String,
    status: { type: String, default: "offline" },
    createdAt: { type: Date, default: Date.now  },
    updated_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('register',user)


