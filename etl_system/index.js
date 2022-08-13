const csv = require('csv');
const now = require('performance-now');

const pool = require('../primaryDB/index');
const extract = require('./extract');
const load = require('./load');

const options = {
  product: {
    tableName: 'hr_sdc.products',
    colNames: 'id,name,slogan,description,category,default_price',
  },
  reviews: {
    tableName: 'hr_sdc.reviews',
    colNames: 'id,product_id,rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness',
  },
  reviews_photos: {
    tableName: 'hr_sdc.photos',
    colNames: 'id,review_id,url',
  },
  characteristics: {
    tableName: 'hr_sdc.characteristics',
    colNames: 'id,product_id,name',
  },
};

const basicETL = () => load.copy(pool, 'product', options.product)
  .then(() => load.copy(pool, 'reviews', options.reviews))
  .then(() => load.copy(pool, 'reviews_photos', options.reviews_photos))
  .then(() => load.copy(pool, 'characteristics', options.characteristics))
  .catch((err) => {
    setImmediate(() => { throw err; });
  });

const updateCharETL = (fileName) => {
  const start = now();

  // track lines and compose updateObj for load module when reading X lines
  const maxLine = 100000;
  let lineCount = 0;
  let updateObj = {};
  const stream = extract.getInputFileStream(fileName)
    .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
    .on('data', async (row) => {
      lineCount ++;
      const charId = row[1];
      const value = Number(row[3]);
      if (updateObj[charId]) {
        updateObj[charId].value_total += value;
        updateObj[charId].value_count += 1;
      } else {
        updateObj[charId] = {};
        updateObj[charId].value_total = value;
        updateObj[charId].value_count = 1;
      }

      if (lineCount >= maxLine) {
        // pause reading and load data
        stream.pause();
        await load.update(pool, updateObj, options.characteristics);
        // reset and continue reading
        lineCount = 0;
        updateObj = {};
        stream.resume();
      }
    })
    .on('end', async () => {
      // load the rest of data
      if (Object.keys(updateObj).length > 0) {
        await load.update(pool, updateObj, { tableName: 'hr_sdc.characteristics' });
        updateObj = {};
      }
      console.log(`${fileName} ETL finished!`);
      const end = now();
      console.log(`Time to update characteristics table ${(end - start).toFixed(3)}ms`);
    })
    .on('error', (err) => { console.log(err.message); });
};

// execution pipeline
basicETL()
  .then(() => updateCharETL('characteristic_reviews'))
  .catch((err) => { console.log(err.message); });
