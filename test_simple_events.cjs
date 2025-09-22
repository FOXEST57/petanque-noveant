const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/events',
  method: 'GET'
};

console.log('Testing public access to /api/events...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Public access works!');
    } else {
      console.log('❌ Public access failed');
    }
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end();