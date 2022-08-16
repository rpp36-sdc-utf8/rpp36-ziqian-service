const pool = require('./index');

exports.fetch = (productId, options) => {
  const {count, sort, page} = options;
  // fetch from hr_sdc.reviews based on options
};

exports.insertOne = (productId, data) => {
  // construct query string
  const query = {
    // text: `INSERT INTO ${tableName}(${colNames}) VALUES(${valStr})`,
    text: `INSERT INTO ${tableName}(id,name,slogan,description,category,default_price) VALUES($1,$2,$3,$4,$5,$6)`,
    values: data,
  };

  // query
  return pool
    .query(query)
    .then((res) => console.log(`data added to ${tableName}`))
    .catch((err) => {
      // console.error(err.stack);
      setImmediate(() => { throw err; });
    });
};

exports.updateOne = (reviewId, data) => {
  // update helpfulness/report on review matching id
};
