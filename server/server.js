const express = require('express');
const morgan = require('morgan');
const Models = require('../primaryDB/model');

const app = express();
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.route('/reviews')
  .get((req, res) => {
    const { product_id, page, count, sort } = req.query;
    const options = {
      productId: product_id,
      page: page || 0,
      count: count || 5,
      sort: sort || 'relavent',
    };

    Models.fetchReviews(options)
      .then((results) => {
        let data = {
          product: product_id,
          page: page || 0,
          count: count || 5,
        };
        data.results = results;
        console.log('data', data);
        res.status(200).json(data);
      })
      .catch((err) => res.status(500).json(err));
  })
  .post((req, res) => {
    const data = req.body;
    const { photos, characteristics } = data;
    const result = {};

    Models.insertToReview(data)
      .then(async (reviewId) => {
        result.reviewId = reviewId;
        result.charReviewId = await Models.insertToCharReview(characteristics, reviewId);
        if (photos.length !== 0) {
          result.photoId = await Models.insertToPhotos(photos, reviewId);
        }
        res.status(201).json(result);
      })
      .catch((err) => res.status(500).json(err));
  });

app.get('/reviews/meta', (req, res) => {
  const { product_id } = req.query;

  Models.fetchReviewsMeta(product_id)
    .then((data) => {
      data.product_id = product_id;
      res.status(200).json(data);
    })
    .catch((err) => res.status(500).json(err));
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  const { review_id } = req.params;
  const query = 'helpfulness';

  // res.status(200).json(req.params);

  // Models.updateOne(review_id, query)
  //   .then(() => {
  //     res.send(201).send('Updated');
  //   })
  //   .catch((err) => res.status(500).json(err));
});

app.put('/reviews/:review_id/report', (req, res) => {
  const { review_id } = req.params;
  const query = 'report';

  // res.status(200).json(req.params);

  // Models.updateOne(review_id, query)
  //   .then(() => {
  //     res.send(201).send('Updated');
  //   })
  //   .catch((err) => res.status(500).json(err));
});

module.exports = app;
