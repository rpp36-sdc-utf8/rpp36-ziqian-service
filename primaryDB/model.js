const pool = require('./index');
const format = require('pg-format');
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
    SELECT name, avg(value) AS value
    FROM hr_sdc.characteristic_reviews rv
    JOIN hr_sdc.characteristics char on char.id=rv.characteristic_id
    JOIN hr_sdc.reviews r on r.id=rv.review_id where r.reported=false and char.product_id=${productId}
    GROUP BY name;
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

exports.insertToReview = (data) => {
  // const photos = JSON.parse(data.photos);
  // const characteristics = JSON.parse(data.characteristics);

  // construct query string
  const query = {
    text: `
      INSERT INTO hr_sdc.reviews
      (reviewer_name, reviewer_email, rating, summary, recommend, body, date, product_id)
      VALUES (%L)
      RETURNING id;
      `,
    values: [
      data.name, data.email, Number(data.rating), data.summary,
      Boolean(data.recommend), data.body, Date.now(), data.product_id,
    ],
  };

  return pool
    .query(format(query.text, query.values))
    .then((res) => res.rows[0].id)
    .catch((err) => { throw err; });
    // .then((res) => {
    //   const reviewId = res.rows[0].id;
    //   const result = {};
    //   result.reviewId = reviewId;

      // if (characteristics) {
      //   const values = Object.keys(characteristics).reduce((valArr, charId) => {
      //     const temp = [charId, reviewId, characteristics[charId]];
      //     valArr.push(temp);
      //     return valArr;
      //   }, []);

      //   const insertToChar = {
      //     text: 'INSERT INTO hr_sdc.characteristic_reviews(characteristic_id, review_id, value) VALUES %L RETURNING id',
      //     values,
      //   };

      //   const charReviewId = await pool
      //     .query(format(insertToChar.text, insertToChar.values))
      //     .then((charReviewTable) => charReviewTable.rows[0].id);

      //   result.charReviewId = charReviewId;
      // }

      // if has photos
      // if (photos.length !== 0) {
      //   const values = photos.reduce((valArr, photoUrl) => {
      //     const temp = [photoUrl, reviewId];
      //     valArr.push(temp);
      //     return valArr;
      //   }, []);

      //   const insertToPhotos = {
      //     text: 'INSERT INTO hr_sdc.photos (url, review_id) VALUES %L RETURNING id',
      //     values,
      //   };

      //   const photoId = await pool
      //     .query(format(insertToPhotos.text, insertToPhotos.values))
      //     .then((photosTable) => photosTable.rows[0].id);

      //   result.photoId = photoId;
      // }
    // });
};

exports.insertToCharReview = (data, reviewId) => {
  const values = Object.keys(data).reduce((valArr, charId) => {
    const temp = [charId, reviewId, data[charId]];
    valArr.push(temp);
    return valArr;
  }, []);

  const query = {
    text: 'INSERT INTO hr_sdc.characteristic_reviews(characteristic_id, review_id, value) VALUES %L RETURNING id',
    values,
  };

  return pool
    .query(format(query.text, query.values))
    .then((res) => res.rows[0].id)
    .catch((err) => { throw err; });
};

exports.insertToPhotos = (data, reviewId) => {
  const values = data.reduce((valArr, photoUrl) => {
    const temp = [photoUrl, reviewId];
    valArr.push(temp);
    return valArr;
  }, []);

  const query = {
    text: 'INSERT INTO hr_sdc.photos (url, review_id) VALUES %L RETURNING id',
    values,
  };

  return pool
    .query(format(query.text, query.values))
    .then((res) => res.rows[0].id)
    .catch((err) => { throw err; });
};

exports.updateReview = (reviewId, options) => {
  // update helpfulness/report on review matching id
};
