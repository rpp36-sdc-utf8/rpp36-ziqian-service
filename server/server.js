const express = require('express');
const morgan = require('morgan');
const Models = require('../primaryDB/index');

const app = express();
app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.route('/reviews')
  .get((req, res) => {
    // fetch data
    // respond with data
  })
  .post((req, res) => {
    // insert data
    // respond with success when insert happens
  })

app.get('reviews/meta', (req, res) => {
  // fetch reviews meta data
  // respond with reivews meta data
});

app.put('/reviews/:review_id/helpful', (req, res) =>{
  // update query to db
  // send response after success update
});

app.put('/reviews/:review_id/report', (req, res) => {
  // update query to db
  // send response after success update
});

module.exports = app;
