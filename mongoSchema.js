const mongoose = require('mongoose');

const { Schema } = mongoose;

// mongoose adds '_id' to schema
const productSchema = new Schema({
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: Number,
});

const reviewsSchema = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: String,
  email: String,
  rating: Number,
  summary: String,
  body: String,
  date: String,
  recommend: Boolean,
  reviewer_name: String,
  response: { type: String, default: null },
  helpfulness: { type: Number, default: 0 },
  report: { type: Boolean, defualt: false },
  photos: [{
    id: Number,
    url: String,
  }],
  characteristics: {
    Size: {
      id: Number,
      value: String,
    },
    Width: {
      id: Number,
      value: String,
    },
    Comfort: {
      id: Number,
      value: String,
    },
    Quality: {
      id: Number,
      value: String,
    },
    Fit: {
      id: Number,
      value: String,
    },
    Length: {
      id: Number,
      value: String,
    },
  },
});

const Products = mongoose.model('Product', productSchema);
const Reviews = mongoose.mode('Reviews', reviewsSchema);
