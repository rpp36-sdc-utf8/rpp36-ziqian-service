import http from 'k6/http';
import { check } from 'k6';
import { createTestData, clearUpTestData } from './testData.js';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      preAllocatedVUs: 100, // how large the initial pool of VUs would be
      maxVUs: 1000, // if the preAllocatedVUs are not enough, we can initialize more
      gracefulStop: '30s',
      stages: [
        { target: 1, duration: '5s' }, // 1 iterations per `timeUnit` for the first 5s.
        // { target: 10, duration: '10s' },
        // { target: 100, duration: '30s' },
        // { target: 1000, duration: '30s' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(100)<2000'], // 100% of requests should be below 2000ms
  },
};

export function setup() {
  // create 10000 fake data to review table
  createTestData();
}

// PUT /reviews/:review_id/helpful
export default () => {
  const res = http.put(http.url`http://localhost:2000/reviews/1000011/helpful`);
  check(res, {
    'is status 200': (r) => r.status === 201,
  });
};

export function teardown() {
  // remove 10000 fake data to review table
  clearUpTestData();
}
