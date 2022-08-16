const pool = require('./index');

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const fetchPhotos = (reviewId) => {
  // fetch all photos
};

const fetchCharacteristic = (productId) => {
  // fetch chars and construct into an obj to return
}

exports.fetchReviews = (options) => {
  const {productId, count, sort, page} = options;
  // fetch reviews from hr_sdc.reviews based on options
  // get all reviews_id and look for photos for those reviews
};

exports.fetchReviewsMeta = (productId) => {
  // query to fetch all reviews with product_id column rating, recommended
  // query to fetch characteristics name, total, count
  // constuct the response object
};

exports.insertOne = (productId, data) => {
  // if data has photos
    // reconstruct data to review data and photo data

  // get characteristics

  // construct query string
  const insertToReviews = {
    text: `INSERT INTO hr_sdc.reviews () VALUES($1,$2,$3,$4,$5,$6)`,
    values: data,
  };

  return pool
    .query(insertToReviews)
    .then((data) => {
      // get insertId for reviews
      // if has photos
        // insert photos
      // update characteristics
    });
};

exports.updateOne = (reviewId, options) => {
  // update helpfulness/report on review matching id
};
