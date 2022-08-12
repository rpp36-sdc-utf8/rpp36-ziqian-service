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
  characteristics: {
    tableName: 'hr_sdc.characteristics',
    colNames: 'id,product_id,name',
    numOfCols: 3,
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
  const maxLine = 100000;
  let lineCount = 0;
  let updateObj = {};
  // let totalLine = 0;
  const stream = extract.getInputFileStream(fileName)
    .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
    .on('data', async (row) => {
      lineCount ++;
      // totalLine ++;
      const charId = row[1];
      const value = Number(row[3]);
      // every time there is line read
      if (updateObj[charId]) {
        updateObj[charId].value_total += value;
        updateObj[charId].value_count += 1;
      } else {
        updateObj[charId] = {};
        updateObj[charId].value_total = value;
        updateObj[charId].value_count = 1;
      }

      // if lineCount >= maxLine
      if (lineCount >= maxLine) {
        stream.pause();
        // await load.updateChar(pool, row, { tableName: 'hr_sdc.characteristics' });
        await load.updateChar(pool, updateObj, { tableName: 'hr_sdc.characteristics' });
        lineCount = 0;
        updateObj = {};
        stream.resume();
      }

      // if (totalLine === 1000000) {
      //   stream.destroy();
      // }
    })
    .on('end', async () => {
      if (Object.keys(updateObj).length > 0) {
        await load.updateChar(pool, updateObj, { tableName: 'hr_sdc.characteristics' });
        updateObj = {};
      }
      console.log(`${fileName} reading finished!`);
    })
    .on('error', (err) => { console.log(err.message); });
};

// execution pipeline
basicETL()
  .then(() => updateCharETL('characteristic_reviews'))
  .catch((err) => { console.log(err.message); });

// updateCharETL('characteristic_reviews');
