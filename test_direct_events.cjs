const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/events',
  method: 'GET',
  headers: {
    'User-Agent': 'test-client'
  }
};

console.log('Testing direct access to /api/events...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Direct access successful');
    } else {
      console.log('❌ Direct access failed');
    }
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();