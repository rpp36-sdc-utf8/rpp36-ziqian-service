const fs = require('fs');
const path = require('path');

exports.getInputFileStream = (fileName) => fs.createReadStream(path.join(__dirname, `examples/${fileName}.csv`));
