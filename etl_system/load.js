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
