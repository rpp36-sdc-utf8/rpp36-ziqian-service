const path = require('path');

exports.insertOne = (pool, data, options) => {
  const valuesArr = [];
  for (let i = 1; i <= options.numOfCols; i++) {
    valuesArr.push(`$${i}`);
  }
  const valuesStr = valuesArr.join(',');

  const query = {
    text: `INSERT INTO ${options.tableName} (${options.colNames}) VALUES(${valuesStr})`,
    values: data,
  };

  return pool
    .query(query)
    .then(() => console.log(`${data[0]} added to ${options.tableName}`))
    .catch((err) => {
      setImmediate(() => { throw err; });
    });
};

exports.copy = (pool, fileName, options) => {
  const filePath = path.join(__dirname, `examples/${fileName}.csv`);

  // console.log(filePath, fileName, options);
  const query = `
    COPY ${options.tableName}(${options.colNames})
    FROM '${filePath}'
    DELIMITER ','
    CSV HEADER;
  `;

  return pool
    .query(query)
    .then(() => console.log(`complete copying ${options.tableName} from ${filePath}`))
    // .catch((err) => {
    //   setImmediate(() => { throw err; });
    // });
}

exports.updateChar = (pool, data, options) => {
  const query = `UPDATE ${options.tableName}
      SET value_total=value_total+${data[3]}, value_count=value_count+1
      WHERE id=${data[1]}`;

  return pool
    .query(query)
    .then(() => console.log(`${data[0]} added to ${options.tableName}`))
    .catch((err) => { throw err; });
};
