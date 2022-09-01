import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 1 },
    { duration: '10s', target: 10 },
    { duration: '15s', target: 100 },
    { duration: '1m', target: 1000 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(100)<2000'], // 100% of requests should be below 2000ms
  },
};

// GET /reviews
export default () => {
  const startId = 1000010;
  const varyProductId = 10;
  for (let id = startId; id > (startId - varyProductId); id --) {
    const res = http.get(http.url`http://localhost:2000/reviews?count=2&product_id=${id}`);
    check(res, {
      'is status 200': (r) => r.status === 200,
    });
  }
};

// GET /reviewsMeta

// PUT /reviews/:review_id/report

// PUT /reviews/:review_id/helpful

// POST /reviews

// batch GET requests
