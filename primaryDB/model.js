const pool = require('./index');
const helper = require('./helper');

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
  const ratingQueryStr = `
    SELECT rating, count(*)
    FROM hr_sdc.reviews
    WHERE product_id=${productId}
    AND reported=false
    GROUP BY rating;
    `;
  const recommendQueryStr = `
    SELECT recommend, count(*)
    FROM hr_sdc.reviews
    WHERE product_id=${productId}
    AND reported=false
    GROUP BY recommend;
    `;
  const charQueryStr = `
    SELECT name, value_total/value_count AS value
    FROM hr_sdc.characteristics
    WHERE product_id=${productId}
    `;
  // query to fetch all reviews with column rating, recommended
  const ratingQuery = pool.query(ratingQueryStr);
  const recommendedQuery = pool.query(recommendQueryStr);
  // query to fetch characteristics name, total, count
  const charQuery = pool.query(charQueryStr);

  return Promise.all([ratingQuery, recommendedQuery, charQuery])
    .then((result) => {
      const [rating, recommend, char] = result;
      const ratings = helper.convertArrToObj(rating.rows, 'rating', 'count');
      const recommended = helper.convertArrToObj(recommend.rows, 'recommend', 'count');
      const characteristics = helper.convertArrToObj(char.rows, 'name', 'value');

      console.log(ratings, recommended, characteristics);
      return {
        ratings,
        recommended,
        characteristics,
      };
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
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
