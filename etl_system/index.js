const csv = require('csv');

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
};

const basicETL = (fileName) => {
  extract.getInputFileStream(fileName)
    .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
    .on('data', async (row) => {
      // query the database to add data. Returns a promise.
      await load.insertOne(pool, row, options[fileName]);
    })
    .on('end', () => {
      console.log(`${fileName} reading finished!`);
    })
    .on('error', (err) => {
      console.log(err.message);
    });
};

basicETL('product');
basicETL('reviews');
basicETL('reviews_photos');
