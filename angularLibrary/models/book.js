var mongoose = require('mongoose');
var User = require('./user');
var Category = require('./category');
var Schema = mongoose.Schema;
var schemaOptions = {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
};
var BookSchema = new Schema({
  name: String,
  author: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  published: Date,
  blurb: String,
  currentUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, schemaOptions)

module.exports = mongoose.model('Book', BookSchema);
