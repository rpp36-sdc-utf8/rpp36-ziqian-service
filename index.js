const app = require('./server');

const port = 2000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
