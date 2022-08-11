const csv = require('csv');
// const { Client } = require('pg');

const pool = require('../primaryDB/index');
const extract = require('./extract');
const load = require('./load');

const options = {
  product: {
    tableName: 'hr_sdc.products',
    colNames: 'id,name,slogan,description,category,default_price',
    numOfCols: 6,
  },
  reviews: {
    tableName: 'hr_sdc.reviews',
    colNames: 'id,product_id,rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness',
    numOfCols: 12,
  },
  reviews_photos: {
    tableName: 'hr_sdc.photos',
    colNames: 'id,review_id,url',
    numOfCols: 3,
  },
  characteristics: {
    tableName: 'hr_sdc.characteristics',
    colNames: 'id,product_id,name',
    numOfCols: 3,
  },
};

// const client = new Client({
//   user: 'ziqianli',
//   host: 'localhost',
//   database: 'ziqianli',
//   port: 5432,
// });
// client.connect();

// const basicETL = (fileName) => {
//   extract.getInputFileStream(fileName)
//     .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
//     .on('data', async (row) => {
//       await load.insertOne(pool, row, options[fileName]);
//     })
//     .on('end', () => {
//       console.log(`${fileName} reading finished!`);
//     })
//     .on('error', (err) => {
//       console.log(err.message);
//     });
// };

const basicETL = () => load.copy(pool, 'product', options.product)
  .then(() => load.copy(pool, 'reviews', options.reviews))
  .then(() => load.copy(pool, 'reviews_photos', options.reviews_photos))
  .then(() => load.copy(pool, 'characteristics', options.characteristics))
  .catch((err) => {
    setImmediate(() => { throw err; });
  });

const updateCharETL = (fileName) => {
  extract.getInputFileStream(fileName)
    .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      load.updateChar(pool, row, { tableName: 'hr_sdc.characteristics' });
    })
    .on('end', () => {
      console.log(`${fileName} reading finished!`);
    })
    .on('error', (err) => {
      console.log(err.message);
    });
};

// basicETL('product');
// basicETL('reviews');
// basicETL('reviews_photos');
// basicETL('characteristics');
basicETL()
  .then(() => updateCharETL('characteristic_reviews'));
