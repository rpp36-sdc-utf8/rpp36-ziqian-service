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
  const query = Object.keys(data).reduce((consolidQuery, charId) => {
    const updateCharIdQuery = `UPDATE ${options.tableName}
      SET value_total=value_total+${data[charId].value_total}, value_count=value_count+${data[charId].value_count}
      WHERE id=${charId};\n`;
    return consolidQuery + updateCharIdQuery;
  }, '');

  return pool
    .query(query)
    .then(() => console.log(`${Object.keys(data)} added to ${options.tableName}`))
    .catch((err) => { throw err; });

  // const queryPromises = Object.keys(data).reduce((qPromise, charId) => {
  //   const updateCharIdQuery = `UPDATE ${options.tableName}
  //     SET value_total=value_total+${data[charId].value_total}, value_count=value_count+${data[charId].value_count}
  //     WHERE id=${charId};\n`;
  //   // console.log(updateCharIdQuery);
  //   qPromise.push(pool.query(updateCharIdQuery));
  //   return qPromise;
  // }, []);

  // return Promise.all(queryPromises)
  //   .then(() => console.log(`${Object.keys(data)} added to ${options.tableName}`))
  //   .catch((err) => { throw err; });
};
