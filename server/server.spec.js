const request = require('supertest');
const server = require('./server');

describe('Test the root path', () => {
  test('It should response the GET method', () => {
    request(server)
      .get('/')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});

describe('GET /reviews/:product_id', () => {
  it.todo('response with json and status of 200, product_id=71701');
  it.todo('response with empty json and status of 204 when there is no reviews for a product, product_id=3');
  it.todo('response should not contain reported reviews, product_id=3134, no id=18199');
  describe('response with correct pagination and sorting for product_id=1000011', () => {
    it.todo('should use default page 0, count 5 and sort relevance when not provided');
    it.todo('should response with 2 reviews and page 1');
    it.todo('should response with 5 reviews sorted by newest');
    it.todo('should response with 5 reviews sorted by helpfulness');
  });
});

describe('GET /reviews/meta', () => {
  describe('response with product_id=71701', () => {
    it.todo('should have status of 200');
    it.todo('should be in json format');
    it.todo('should contain correctly formatted json');
  });
  it.todo('should not counting reported reviews, product_id=356 no id=1973');
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
