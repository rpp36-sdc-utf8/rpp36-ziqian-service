const path = require('path');
const now = require('performance-now');

exports.copy = (pool, fileName, options) => {
  const start = now();
  const filePath = path.join(__dirname, `legacy_data/${fileName}.csv`);
  const query = `
    COPY ${options.tableName}(${options.colNames})
    FROM '${filePath}'
    DELIMITER ','
    CSV HEADER;
    `;

  return pool
    .query(query)
    .then(() => {
      const end = now();
      console.log(`complete copying ${options.tableName} from ${filePath} in ${(end - start).toFixed(3)}ms.`);
    });
};

exports.syncSerialId = (pool, options) => {
  const query = `
    SELECT setval( pg_get_serial_sequence('${options.tableName}', 'id'),
    (SELECT max(id) FROM ${options.tableName}));
    `;
  return pool
    .query(query)
    .then(() => {
      console.log(`complete sync serial id for ${options.tableName}`);
    });
}

// exports.update = (pool, data, options) => {
//   const query = Object.keys(data).reduce((consolidQuery, charId) => {
//     const updateCharIdQuery = `UPDATE ${options.tableName}
//       SET value_total=value_total+${data[charId].value_total}, value_count=value_count+${data[charId].value_count}
//       WHERE id=${charId};\n`;
//     return consolidQuery + updateCharIdQuery;
//   }, '');

//   return pool
//     .query(query)
//     // .then(() => console.log(`${Object.keys(data)} added to ${options.tableName}`))
//     .catch((err) => { throw err; });
// };
