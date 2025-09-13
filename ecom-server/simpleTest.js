console.log('Starting test...');

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/variants/all',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
  });
});

req.on('error', (err) => {
  console.log('Error:', err.message);
});

req.end();
console.log('Request sent...');
