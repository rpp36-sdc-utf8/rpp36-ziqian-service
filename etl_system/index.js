const csv = require('csv');
const now = require('performance-now');

const pool = require('../primaryDB/index');
const extract = require('./extract');
const load = require('./load');

const options = {
  product: {
    tableName: 'hr_sdc.products',
    colNames: 'id,name,slogan,description,category,default_price',
  },
  reviews: {
    tableName: 'hr_sdc.reviews',
    colNames: 'id,product_id,rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness',
  },
  reviews_photos: {
    tableName: 'hr_sdc.photos',
    colNames: 'id,review_id,url',
  },
  characteristics: {
    tableName: 'hr_sdc.characteristics',
    colNames: 'id,product_id,name',
  },
  characteristic_reviews: {
    tableName: 'hr_sdc.characteristic_reviews',
    colNames: 'id,characteristic_id,review_id,value',
  },
};

const basicETL = () => load.copy(pool, 'product', options.product)
  .then(() => load.copy(pool, 'reviews', options.reviews))
  .then(() => load.copy(pool, 'reviews_photos', options.reviews_photos))
  .then(() => load.copy(pool, 'characteristics', options.characteristics))
  .then(() => load.copy(pool, 'characteristic_reviews', options.characteristic_reviews))
  .catch((err) => {
    setImmediate(() => { throw err; });
  });

const syncSerialId = () => load.syncSerialId(pool, options.reviews)
  .then(() => load.syncSerialId(pool, options.reviews_photos))
  .then(() => load.syncSerialId(pool, options.characteristic_reviews))
  .catch((err) => {
    setImmediate(() => { throw err; });
  });

// execution pipeline
basicETL()
  .then(() => syncSerialId())
  .catch((err) => { console.log(err.message); });
