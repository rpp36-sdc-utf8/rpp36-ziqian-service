const supertest = require('supertest');
const server = require('./server');
const pool = require('../primaryDB/index');

const request = supertest(server);

const clearTestData = () => (
  pool
    .query('SELECT max(id) FROM hr_sdc.reviews')
    .then(async (res) => {
      const reviewId = res.rows[0].max;
      if (reviewId > 5774952) {
        // delete testing data from db
        const queryToDeleteTestData = `
          DELETE FROM hr_sdc.characteristic_reviews WHERE review_id between 5774953 and ${reviewId};
          DELETE FROM hr_sdc.photos WHERE review_id between 5774953 and ${reviewId};
          DELETE FROM hr_sdc.reviews WHERE id between 5774953 and ${reviewId};
        `;
        return pool.query(queryToDeleteTestData);
      }
      return reviewId;
    })
    .catch((err) => { throw err; })
);

const syncSerialId = () => {
  const queryToSyncSerialId = `
    SELECT setval( pg_get_serial_sequence('hr_sdc.reviews', 'id'), 5774952);
    SELECT setval( pg_get_serial_sequence('hr_sdc.characteristic_reviews', 'id'), 19327575);
    SELECT setval( pg_get_serial_sequence('hr_sdc.photos', 'id'), 2742540);
  `;
  return pool
    .query(queryToSyncSerialId)
    .catch((err) => { throw err; });
};

// close pool after all test is complete
afterAll(() => pool.end());

describe('GET /reviews', () => {
  it('response with correct json and status of 200', () => (
    request
      .get('/reviews')
      .query({ product_id: 105 })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toEqual(require('./specData/reviewForP105.json'));
      })
  ));

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
    let defaultSortResponse;
    let newestSortResponse;
    let helpfulnessSortResponse;

    it('should use default page 0, count 5 and sort relevance when not provided in query', () => (
      request
        .get('/reviews')
        .query(query)
        .then((res) => {
          defaultSortResponse = res.body;
          // defaultSortResponse = data;
          expect(defaultSortResponse.page).toBe(0);
          expect(defaultSortResponse.count).toBe(5);
          expect(defaultSortResponse.results.length).toBe(5);
          expect(defaultSortResponse.results[0].review_id).toBe(5774947);
          expect(defaultSortResponse.results[4].review_id).toBe(5774943);
        })
    ));

    it('should response with 5 reviews sorted by newest', () => {
      query.sort = 'newest';
      return request
        .get('/reviews')
        .query(query)
        .then((res) => {
          // const data = res.body;
          newestSortResponse = res.body;
          for (let i = 0; i < newestSortResponse.results.length - 1; i ++) {
            const newerReviewDate = new Date(newestSortResponse.results[i].date);
            const olderReviewDate = new Date(newestSortResponse.results[i + 1].date);
            expect(newerReviewDate > olderReviewDate).toBeTruthy();
          }
        });
    });

    it('should response with 5 reviews sorted by helpfulness', () => {
      query.sort = 'helpful';
      return request
        .get('/reviews')
        .query(query)
        .then((res) => {
          // const data = res.body;
          helpfulnessSortResponse = res.body;
          for (let i = 0; i < helpfulnessSortResponse.results.length - 1; i ++) {
            const higherReviewHelpfulness = helpfulnessSortResponse.results[i].helpfulness;
            const lowerReviewHelpfulness = helpfulnessSortResponse.results[i + 1].helpfulness;
            expect(higherReviewHelpfulness > lowerReviewHelpfulness).toBeTruthy();
          }
        });
    });

    it('should sort differently with relevance(default) to sorted by helpfulness or newest', () => {
      expect(defaultSortResponse).not.toEqual(helpfulnessSortResponse);
      expect(defaultSortResponse).not.toEqual(newestSortResponse);
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
  afterAll(() => (
    clearTestData()
      .then(() => syncSerialId())
      .catch((err) => console.log(err))
  ));

  describe('send json with photo', () => {
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
      const queryStr = 'SELECT id, url FROM hr_sdc.photos WHERE review_id=(SELECT max(id) FROM hr_sdc.reviews)';
      const addedPhotoData = await pool.query(queryStr);
      expect(addedPhotoData.rows[0].id).toBe(2742541);
      expect(addedPhotoData.rows[0].url).toBe('urlplaceholder/review_5_photo_number_1.jpg');
    });
  });

  it('should NOT add to photos table if no photos is in the review', () => (
    request
      .post('/reviews')
      .send(require('./specData/postNoPhotoForP71701'))
      .then(async (res) => {
        const maxPhotoId = await pool.query('SELECT max(id) FROM hr_sdc.photos');
        expect(maxPhotoId.rows[0].max).toBe(2742541);
      })
  ));

  it('should response with 500 when review does not contain all required field', () => (
    request
      .post('/reviews')
      .send({"product_id": 71701,
        "rating": 4,
        "summary": "test2",
        "body": "test2",
        "name": "test2",
      })
      .expect(500)
  ));
});

describe('PUT /reviews/:review_id/helpful', () => {
  afterAll(() => (
    pool.query('UPDATE hr_sdc.reviews SET helpfulness=14 WHERE id=5774952;')
  ));

  it('should respond Updated with status of 201', () => (
    request
      .put('/reviews/5774952/helpful')
      .expect(201)
      .then((res) => {
        expect(res.text).toBe('Updated');
      })
  ));

  it('should update database on the helpfulness of the review_id in the route', async () => {
    const helpful = await pool.query('SELECT helpfulness FROM hr_sdc.reviews WHERE id=5774952;');
    expect(helpful.rows[0].helpfulness).toBe(15);
  });
});

describe('PUT /reviews/:review_id/report', () => {
  afterAll(async () => {
    pool.query('UPDATE hr_sdc.reviews SET reported=false WHERE id=5774952;');
  });

  it('should respond Updated with status of 201', () => (
    request
      .put('/reviews/5774952/report')
      .expect(201)
      .then((res) => {
        expect(res.text).toBe('Updated');
      })
  ));

  it('should update database on the report to true of the review_id in the route', async () => {
    const reported = await pool.query('SELECT reported FROM hr_sdc.reviews WHERE id=5774952;')
    expect(reported.rows[0].reported).toBe(true);
  });
});
