const express = require('express');
const morgan = require('morgan');
const models = require('./primaryDB/index');

const app = express();
app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;
