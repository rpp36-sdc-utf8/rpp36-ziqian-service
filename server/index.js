require('newrelic');

const server = require('./server');

const port = 2000;

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
