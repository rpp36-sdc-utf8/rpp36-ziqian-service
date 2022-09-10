import http from 'k6/http';
import { check } from 'k6';

export const options = {
  tags: {
    testName: 'get-reviews',
  },
  scenarios: {
    // constant_vus: {
    //   executor: 'ramping-vus',
    //   stages: [
    //     { duration: '15s', target: 10 },
    //     { duration: '30s', target: 100 },
    //     { duration: '30s', target: 500 },
    //     { duration: '30s', target: 1000 },
    //     { duration: '30s', target: 100 },
    //     { duration: '15s', target: 10 },
    //   ],
    // },
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000, // iterations per 'timeUnit'.
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 100,
      maxVUs: 1000,
      gracefulStop: '1m',
    },
    // constant_request_rate: {
    //   executor: 'ramping-arrival-rate',
    //   startRate: 1,
    //   timeUnit: '1s', // 1 iterations per second, i.e. 1000 RPS
    //   preAllocatedVUs: 100, // how large the initial pool of VUs would be
    //   maxVUs: 1000, // if the preAllocatedVUs are not enough, we can initialize more
    //   gracefulStop: '30s',
    //   stages: [
    //     // It should start 1 iterations per `timeUnit` for the first 5s.
    //     { target: 1, duration: '5s' },
    //     { target: 10, duration: '5s' },
    //     { target: 100, duration: '15s' },
    //     { target: 1000, duration: '30s' },
    //     { target: 2000, duration: '1m' },
    //     { target: 500, duration: '30s' }, // ramp down
    //     { target: 100, duration: '30s' },
    //   ],
    // },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(100)<2000'], // 100% of requests should be below 2000ms
  },
};

// GET /reviews
export default () => {
  const randomId = Math.floor(1000011 * 0.9) + Math.floor(Math.random() * 1000010 * 0.1);
  const res = http.get(http.url`http://localhost:2000/reviews?count=2&product_id=${randomId}`);
  check(res, {
    'is status 200': (r) => {
      if (r.status === 500) {
        console.log(randomId);
      }
      return r.status === 200;
    },
  });
};

// POST /reviews

// batch GET requests
