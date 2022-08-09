const fs = require('fs');
const path = require('path');
const csv = require('csv');
const model = require('../primaryDB/model');

const inputFileStream = fs.createReadStream(path.join(__dirname, 'examples/product.csv'));

inputFileStream
  .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
  .on('data', (row) => {
    // console.log(row);
    model.insertOne(row, 'hr_sdc.products', 'id,name,slogan,description,category,default_price')
      .then(() => console.log(row));
  })
  .on('end', () => {
    console.log('finished');
  })
  .on('error', (err) => {
    console.log(err.message);
  });
