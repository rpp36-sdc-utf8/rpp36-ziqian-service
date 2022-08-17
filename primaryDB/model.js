const pool = require('./index');

const fetchPhotos = (reviewId) => {
  const queryStr = `SELECT * FROM hr_sdc.photos WHERE review_id=${reviewId};`;
  return pool
    .query(queryStr)
    .then((data) => data.rows)
    .catch((err) => { throw err; });
};

const fetchCharacteristic = (productId) => {
  // fetch chars and construct into an obj to return
};

exports.fetchReviews = (options) => {
  const { productId, sort, count, page } = options;
  let sortStr;

  // order by clause
  switch (sort) {
    case 'newest':
      sortStr = 'date DESC';
      break;
    case 'helpful':
      sortStr = 'helpfulness DESC';
      break;
    default:
      sortStr = 'id';
  }

  const queryStr = `
    SELECT *
    FROM hr_sdc.reviews
    WHERE product_id=${productId}
    AND reported=false
    ORDER BY ${sortStr}
    LIMIT ${count}
    OFFSET ${page * count};
  `;

  return pool
    .query(queryStr)
    .then(async (data) => {
      // make a copy of reviews data
      let reviews = data.rows.slice();

      // get all photos for reviews
      const photosPromises = reviews.map((review) => fetchPhotos(review.id));
      const photos = await Promise.all(photosPromises)
        .then((photo) => photo)
        .catch((err) => { throw err; });

      for (let i = 0; i < reviews.length; i ++) {
        let review = reviews[i];
        let photo = photos[i];

        // clean up data
        delete photo.review_id;
        review.photos = photo;
        delete review.product_id;
        review.date = Date(review.date);

        // updated reivew
        reviews[i] = review;
      }

      return reviews;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

exports.fetchReviewsMeta = (productId) => {
  // query to fetch all reviews with column rating, recommended
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
