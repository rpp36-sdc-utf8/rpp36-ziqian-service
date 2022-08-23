const supertest = require('supertest');
const server = require('./server');
const pool = require('../primaryDB/index');

const request = supertest(server);

afterAll(() => {
  const query = `
    SELECT setval( pg_get_serial_sequence('hr_sdc.reviews', 'id'), 5774952);
    SELECT setval( pg_get_serial_sequence('hr_sdc.characteristic_reviews', 'id'), 19327575);
    SELECT setval( pg_get_serial_sequence('hr_sdc.photos', 'id'), 2742540);
    `;
  return pool
    .query(query)
    .then(() => pool.end());
});

describe('Test the root path', () => {
  test('It should response the GET method', () => (
    request
      .get('/')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      })
  ));
});

describe('GET /reviews', () => {
  it('response with correct json and status of 200', () => (
    request
      .get('/reviews')
      .query({ product_id: 71701 })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toEqual(require('./specData/reviewForP71701.json'));
      })
  ));

  it.todo('response with empty json and status of 204 when there is no reviews for a product, product_id=3');

  it('response should not contain reported reviews', () => (
    request
      .get('/reviews')
      .query({ product_id: 3134, count: 20 })
      .then((res) => {
        const data = res.body;
        data.results.length = 9;
        const reviewIds = data.results.map((reviewObj) => reviewObj.review_id);
        expect(reviewIds).toContain(18198);
        expect(reviewIds).not.toContain(18199);
      })
  ));

  describe('response with correct pagination and sorting', () => {
    const query = { product_id: 1000011 };
    it('should use default page 0, count 5 and sort relevance when not provided in query', () => (
      request
        .get('/reviews')
        .query(query)
        .then((res) => {
          const data = res.body;
          expect(data.page).toBe(0);
          expect(data.count).toBe(5);
          expect(data.results.length).toBe(5);
          expect(data.results[0].review_id).toBe(5774940);
          expect(data.results[4].review_id).toBe(5774944);
        })
    ));

    it('should response with 5 reviews sorted by newest', () => {
      query.sort = 'newest';
      return request
        .get('/reviews')
        .query(query)
        .then((res) => {
          const data = res.body;
          const topReviewDate = new Date(data.results[0].date);
          const secondReviewDate = new Date(data.results[1].date);
          expect(topReviewDate > secondReviewDate).toBeTruthy();
        });
    });

    it('should response with 5 reviews sorted by helpfulness', () => {
      query.sort = 'helpful';
      return request
        .get('/reviews')
        .query(query)
        .then((res) => {
          const data = res.body;
          const topReviewHelpfulness = data.results[0].helpfulness;
          const secondReviewHelpfulness = data.results[1].helpfulness;
          expect(topReviewHelpfulness > secondReviewHelpfulness).toBeTruthy();
        });
    });

    it('should response with 2 reviews and page 1', () => {
      query.sort = '';
      query.page = 2;
      query.count = 2;
      return request
        .get('/reviews')
        .query(query)
        .then((res) => {
          const data = res.body;
          expect(data.page).toBe(1);
          expect(data.count).toBe(2);
          expect(data.results.length).toBe(2);
          expect(data.results[0].review_id).toBe(5774942);
          expect(data.results[1].review_id).toBe(5774943);
        });
    });
  });
});

describe('GET /reviews/meta', () => {
  it('resonse with correct json and status of 200', () => (
    request
      .get('/reviews/meta')
      .query({ product_id: 71701 })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toEqual(require('./specData/reviewMetaForP71701.json'));
      })
  ));
  it('should not include reported reviews, product_id=356 no id=1973', () => (
    request
      .get('/reviews/meta')
      .query({ product_id: 356 })
      .then((res) => {
        const data = res.body;
        const reviewCount = Number(data.recommended.true) + Number(data.recommended.false);
        expect(reviewCount).not.toBe(7);
      })
  ));
});

describe('POST /reviews', () => {
  describe('send json with photo', () => {
    // reset database to before inserting test data
    afterAll(() => (
      pool
        .query('SELECT max(id) FROM hr_sdc.reviews')
        .then(async (res) => {
          const reviewId = res.rows[0].max;

          // delete testing data from db
          const queryToDeleteTestData = `
            DELETE FROM hr_sdc.characteristic_reviews WHERE review_id between 5774953 and ${reviewId};
            DELETE FROM hr_sdc.photos WHERE review_id between 5774953 and ${reviewId};
            DELETE FROM hr_sdc.reviews WHERE id between 5774953 and ${reviewId};
          `;
          await pool.query(queryToDeleteTestData);

          // reset serial number to last item after deleting test data
          const queryToSyncSerialId = `
            SELECT setval( pg_get_serial_sequence('hr_sdc.reviews', 'id'), 5774952);
            SELECT setval( pg_get_serial_sequence('hr_sdc.characteristic_reviews', 'id'), 19327575);
            SELECT setval( pg_get_serial_sequence('hr_sdc.photos', 'id'), 2742540);
          `;
          await pool.query(queryToSyncSerialId);
        })
    ));

    it('should responde with Created and status of 201', () => (
      request
        .post('/reviews')
        .send(require('./specData/postWithPhotoForP71701'))
        .then(async (res) => {
          expect(res.statusCode).toBe(201);
          expect(res.text).toBe('Created');
        })
    ));

    it('should add to reviews table at the end', async () => {
      const queryStr = 'SELECT * FROM hr_sdc.reviews WHERE id=(SELECT max(id) FROM hr_sdc.reviews)';
      const addedReview = await pool.query(queryStr);
      expect(addedReview.rows[0].reviewer_name).toBe('test2');
    });

    it('should add to characteristic_reviews table at the end', async () => {
      const queryStr = 'SELECT value FROM hr_sdc.characteristic_reviews WHERE review_id=(SELECT max(id) FROM hr_sdc.reviews)';
      const charReviewValues = await pool.query(queryStr);
      const valuesArr = charReviewValues.rows.reduce((array, item) => {
        const temp = item.value;
        array.push(temp);
        return array;
      }, []);
      expect(valuesArr.length).toBe(4);
      expect(valuesArr).toContain(3);
      expect(valuesArr).toContain(2);
      expect(valuesArr).toContain(4);
    });

    it('should add to photos table at the end when photo is in the review', async () => {
      const queryStr = 'SELECT url FROM hr_sdc.photos WHERE review_id=(SELECT max(id) FROM hr_sdc.reviews)';
      const photoUrl = await pool.query(queryStr);
      expect(photoUrl.rows[0].url).toBe('urlplaceholder/review_5_photo_number_1.jpg');
    });
  });

  it.todo('should NOT add to photos table if no photos is in the review');
  it.todo('should response with 404 when review does not contain all required field');
});

describe('PUT /reviews/:review_id/helpful', () => {
  it.todo('response Updated with status of 201');
  it.todo('should update database on the helpfulness of the review_id in the route');
});

describe('PUT /reviews/:review_id/report', () => {
  it.todo('response Updated with status of 201');
  it.todo('should update database on the report to true of the review_id in the route');
});
