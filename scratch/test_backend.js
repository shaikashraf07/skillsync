const https = require('https');

const HOST = 'skillsync-api-gnhz.onrender.com';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: HOST,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

async function run() {
  console.log('Trying login with the newly created test user...');
  try {
    const res = await request('POST', '/auth/login', {
      email: 'test_90489@example.com',
      password: 'password123'
    });
    console.log('Login response status:', res.statusCode);
    console.log('Login response body:', res.body);
  } catch (err) {
    console.error('Login request failed:', err.message);
  }
}

run();
