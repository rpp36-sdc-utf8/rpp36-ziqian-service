const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  _id: { type: Number, unique: true },
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: Number,
  ratings: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 },
  },
  recommended: {
    true: { type: Number, default: 0 },
    false: { type: Number, default: 0 },
  },
  characteristics: [{
    _id: { type: Number, unique: true },
    name: String,
    value: Number,
  }],
});

const reviewSchema = new Schema({
  _id: { type: Number, unique: true },
  product_id: Number,
  user_name: String,
  user_email: String,
  rating: Number,
  summary: String,
  body: String,
  date: Date,
  recommend: Boolean,
  reviewer_name: String,
  response: { type: String, default: null },
  helpfulness: { type: Number, default: 0 },
  report: { type: Boolean, defualt: false },
  photos: [{
    id: { type: Number, unique: true },
    url: String,
  }],
});

const Products = mongoose.model('Products', productSchema);
const Reviews = mongoose.model('Reviews', reviewSchema);
