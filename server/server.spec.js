const supertest = require('supertest');
const server = require('./server');
const pool = require('../primaryDB/index');

const request = supertest(server);

afterAll(() => {
  pool.end();
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
        const reviewCount = Number(data.recommended.true) + Number(data.recommended.true);
        const totalReviews = pool.query('SELECT COUNT(*) FROM hr_sdc.reviews WHERE product_id=356');
        expect(reviewCount).not.toBe(totalReviews);
      })
  ));
});

describe('POST /reviews/:product_id', () => {
  it.todo('response Created and status of 201');
  it.todo('should add to reviews table at the end');
  it.todo('should add to characteristic_review table at the end');
  it.todo('should add to photos table at the end when photo is in the review');
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
