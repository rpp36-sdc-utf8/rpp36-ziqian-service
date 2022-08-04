const request = require('supertest');
const app = require('./server');

describe('Test the root path', () => {
  test('It should response the GET method', () => {
    request(app)
      .get('/')
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});
