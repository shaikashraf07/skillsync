import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'], // Request failure rate < 5%
    http_req_duration: ['p(95)<1500'], // 95% of requests should respond in under 1.5s
  },
};

const BASE_URL = __ENV.BACKEND_URL || 'https://skillsync-api-gnhz.onrender.com';

export default function () {
  // Test health check endpoint
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // Test public postings endpoint
  const postingsRes = http.get(`${BASE_URL}/postings`);
  check(postingsRes, {
    'postings status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
