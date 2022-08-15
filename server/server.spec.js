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
