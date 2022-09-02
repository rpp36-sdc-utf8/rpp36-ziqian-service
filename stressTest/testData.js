import pool from '../primaryDB/index';

export async function createTestData() {
  // create 10000 fake data to review table
  await pool.query(`
    INSERT INTO hr_sdc.reviews
    (reviewer_name, reviewer_email, rating, summary, recommend, body, date, product_id)
    VALUES (test1, test1@gmail.com, 4, test1, true, test1, ${Date.now()}, 1000011)
    RETURNING id;
  `)
    .then(() => {
      console.log('Complete create testing data');
    })
    .catch((err) => console.log(err));
}

export async function clearUpTestData() {
  await pool.query(`
  DELETE FROM hr_sdc.characteristic_reviews WHERE review_id between 5774953 and 5774953;
  DELETE FROM hr_sdc.photos WHERE review_id between 5774953 and 5774953;
  DELETE FROM hr_sdc.reviews WHERE id between 5774953 and 5774953;
  SELECT setval( pg_get_serial_sequence('hr_sdc.reviews', 'id'), 5774952);
  SELECT setval( pg_get_serial_sequence('hr_sdc.characteristic_reviews', 'id'), 19327575);
  SELECT setval( pg_get_serial_sequence('hr_sdc.photos', 'id'), 2742540)
`)
    .then(() => {
      console.log('Complete clear testing data');
    })
    .catch((err) => console.log(err));
}
