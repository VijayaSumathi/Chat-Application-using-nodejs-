var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var online = new Schema({
    username:String,
    connection_id:String,
    createdAt: { type: Date, default: Date.now  },
    updated_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('online',online)

