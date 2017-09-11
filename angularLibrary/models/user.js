var mongoose = require('mongoose');
var Book = require('./book');
var Schema = mongoose.Schema;
var schemaOptions = {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
};
var UserSchema = new Schema({
  name: String,
  adress: String,
  memberSince: String,
  books: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],
}, schemaOptions)

module.exports = mongoose.model('User', UserSchema);
