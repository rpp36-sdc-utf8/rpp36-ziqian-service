import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 100, // 1 iterations per 'timeUnit'.
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 100,
      maxVUs: 1000,
      gracefulStop: '1m',
    },
    // constant_request_rate: {
    //   executor: 'ramping-arrival-rate',
    //   startRate: 1,
    //   timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
    //   preAllocatedVUs: 100, // how large the initial pool of VUs would be
    //   maxVUs: 1000, // if the preAllocatedVUs are not enough, we can initialize more
    //   gracefulStop: '30s',
    //   stages: [
    //     // It should start 1 iterations per `timeUnit` for the first 5s.
    //     { target: 1, duration: '5s' },
    //     { target: 10, duration: '10s' },
    //     { target: 100, duration: '30s' },
    //     { target: 1000, duration: '30s' },
    //   ],
    // },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(100)<2000'], // 100% of requests should be below 2000ms
  },
};

// GET /reviewsMeta
export default () => {
  const randomId = 900009 + Math.floor(Math.random() * 100000); // product_id in the last 10% db
  const res = http.get(http.url`http://localhost:2000/reviews/meta?product_id=${randomId}`);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
};
