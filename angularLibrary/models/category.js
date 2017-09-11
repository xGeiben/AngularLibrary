var mongoose  = require('mongoose');
var Book = require('./book');
var Schema = mongoose.Schema;
var schemaOptions = {
    toObject: {
      virtuals: true
    }
    ,toJSON: {
      virtuals: true
    }
  };
var CategorySchema = new Schema({
  name: String,
  description: String,
  books: [{ type: Schema.Types.ObjectId, ref:'Book'}],
},schemaOptions);

module.exports = mongoose.model('Category',CategorySchema);
