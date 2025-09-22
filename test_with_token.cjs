const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/events',
  method: 'GET',
  headers: {
    'User-Agent': 'test-client',
    'Authorization': 'Bearer invalid-token'
  }
};

console.log('Testing with invalid token...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();