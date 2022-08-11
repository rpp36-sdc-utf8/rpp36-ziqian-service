const pool = require('./index');

exports.fetch = () => {};

exports.insertOne = (data, tableName, colNames) => {
  const valStr = Array(colNames.split(',').length).reduce((valArr, current, index) => {
    valStr.push(`$${index + 1}`);
    return valStr;
  }, []).join(',');

  console.log(valStr);

  const query = {
    // text: `INSERT INTO ${tableName}(${colNames}) VALUES(${valStr})`,
    text: `INSERT INTO ${tableName}(id,name,slogan,description,category,default_price) VALUES($1,$2,$3,$4,$5,$6)`,
    values: data,
  };

  return pool
    .query(query)
    .then((res) => console.log(`data added to ${tableName}`))
    .catch((err) => {
      // console.error(err.stack);
      setImmediate(() => { throw err; });
    });
};

exports.updateOne = () => {};
