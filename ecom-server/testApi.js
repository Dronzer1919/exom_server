const http = require('http');

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n--- Testing ${endpoint} ---`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data.substring(0, 500)}${data.length > 500 ? '...' : ''}`);
        resolve(data);
      });
    });

    req.on('error', (err) => {
      console.log(`Error testing ${endpoint}:`, err.message);
      reject(err);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing API endpoints...');
  
  try {
    await testAPI('/api/categories');
    await testAPI('/api/products');
    await testAPI('/api/variants');
  } catch (error) {
    console.log('Test failed:', error.message);
  }
  
  console.log('\nAPI tests completed.');
}

runTests();
