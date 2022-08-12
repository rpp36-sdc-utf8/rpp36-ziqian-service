const path = require('path');

exports.copy = (pool, fileName, options) => {
  const filePath = path.join(__dirname, `legacy_data/${fileName}.csv`);
  const query = `
    COPY ${options.tableName}(${options.colNames})
    FROM '${filePath}'
    DELIMITER ','
    CSV HEADER;
  `;

  return pool
    .query(query)
    .then(() => console.log(`complete copying ${options.tableName} from ${filePath}`));
};

exports.updateChar = (pool, data, options) => {
  const query = `UPDATE ${options.tableName}
      SET value_total=value_total+${data[3]}, value_count=value_count+1
      WHERE id=${data[1]}`;

  return pool
    .query(query)
    .then(() => console.log(`${data[0]} added to ${options.tableName}`))
    .catch((err) => { throw err; });
};
