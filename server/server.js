const express = require('express');
const morgan = require('morgan');
const Models = require('../primaryDB/index');

const app = express();
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.route('/reviews')
  .get((req, res) => {
    const { product_id, page, count, sort } = req.query;
    const options = {
      productId: product_id,
      page: page || 1,
      count: count || 5,
      sort: sort || 'relevant',
    };
    res.status(200).json(req.query);
    // Models.fetchReviews(options)
    //   .then((data) => {
    //     res.status(200).json(data);
    //   })
    //   .catch((err) => res.status(500).send(err));
  })
  .post((req, res) => {
    const body = req.body;
    res.status(200).json(body);

    // Models.insertOne(body)
    //   .then(() => {
    //     res.status(201).send('Created');
    //   })
    //   .catch((err) => res.status(500).send(err));
  });

app.get('/reviews/meta', (req, res) => {
  const { product_id } = req.query;
  res.status(200).json(req.query);

  // Models.fetchReviewsMeta(product_id)
  //   .then((data) => {
  //     res.status(200).json(data);
  //   })
  //   .catch((err) => res.status(500).send(err));
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  const { review_id } = req.params;
  const query = 'helpfulness';
  res.status(200).json(req.params);

  // Models.updateOne(review_id, query)
  //   .then(() => {
  //     res.send(201).send('Updated');
  //   })
  //   .catch((err) => res.status(500).send(err));
});

app.put('/reviews/:review_id/report', (req, res) => {
  const { review_id } = req.params;
  const query = 'report';
  res.status(200).json(req.params);
  // Models.updateOne(review_id, query)
  //   .then(() => {
  //     res.send(201).send('Updated');
  //   })
  //   .catch((err) => res.status(500).send(err));
});

module.exports = app;
