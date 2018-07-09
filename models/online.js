var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var message = new Schema({
    message : String,
    sender  : String,
    reciever: String,
    date    : Date,
    createdAt: { type: Date, default: Date.now  },
    updated_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('message',message)

