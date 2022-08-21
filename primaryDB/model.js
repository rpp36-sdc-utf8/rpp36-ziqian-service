const format = require('pg-format');
const pool = require('./index');
const helper = require('./helper');

const fetchPhotos = (reviewId) => {
  const queryStr = `SELECT * FROM hr_sdc.photos WHERE review_id=${reviewId};`;
  return pool
    .query(queryStr)
    .then((data) => data.rows)
    .catch((err) => { throw err; });
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
    SELECT id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
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
      const reviews = data.rows.slice();

      // get all photos for reviews
      const photosPromises = reviews.map((review) => fetchPhotos(review.review_id));
      const photos = await Promise.all(photosPromises)
        .then((photo) => photo)
        .catch((err) => { throw err; });

      for (let i = 0; i < reviews.length; i ++) {
        const review = reviews[i];
        const photo = photos[i];

        // clean up data
        delete photo.review_id;
        review.photos = photo;
        delete review.product_id;
        review.date = new Date(Number(review.date));

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
    SELECT characteristic_id, name, avg(value) AS value
    FROM hr_sdc.characteristic_reviews rv
    JOIN hr_sdc.characteristics char on char.id=rv.characteristic_id
    JOIN hr_sdc.reviews r on r.id=rv.review_id where r.reported=false and char.product_id=${productId}
    GROUP BY characteristic_id, name;
    `;

  const ratingQuery = pool.query(ratingQueryStr);
  const recommendedQuery = pool.query(recommendQueryStr);
  const charQuery = pool.query(charQueryStr);

  return Promise.all([ratingQuery, recommendedQuery, charQuery])
    .then((result) => {
      const [rating, recommend, char] = result;
      const ratings = helper.convertArrToObj(rating.rows, 'rating', 'count');
      const recommended = helper.convertArrToObj(recommend.rows, 'recommend', 'count');
      const characteristics = helper.convertCharObj(char.rows, 'name', 'value', 'characteristic_id');

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

exports.updateReview = (reviewId, column) => {
  let query;
  if (column === 'helpfulness') {
    query = `UPDATE hr_sdc.reviews SET helpfulness=helpfulness+1 WHERE id=${reviewId}`;
  }
  if (column === 'reported') {
    query = `UPDATE hr_sdc.reviews SET reported=true WHERE id=${reviewId}`;
  }
  return pool
    .query(query)
    .catch((err) => {
      console.log(err);
      throw err;
    });
};
