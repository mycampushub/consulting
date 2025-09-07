#!/usr/bin/env node

const http = require('http');

// Test the simple test endpoint
const tests = [
  {
    name: 'Demo Subdomain Test',
    url: 'http://localhost:3000/api/demo/test'
  },
  {
    name: 'New Subdomain Test (testagency)',
    url: 'http://localhost:3000/api/testagency/test'
  },
  {
    name: 'Another New Subdomain (myagency)',
    url: 'http://localhost:3000/api/myagency/test'
  }
];

console.log('🧪 Testing simple subdomain endpoint...\n');

tests.forEach((test, index) => {
  const req = http.request(test.url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 ${test.name}:`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      
      try {
        const response = JSON.parse(data);
        console.log(`   ✅ Working`);
        console.log(`   Subdomain: ${response.subdomain}`);
        console.log(`   Message: ${response.message}`);
        console.log(`   Timestamp: ${response.timestamp}`);
      } catch (e) {
        console.log(`   ❌ Failed to parse JSON: ${data.substring(0, 100)}`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    });
  });
  
  req.on('error', (e) => {
    console.log(`❌ ${test.name}: Failed to connect - ${e.message}\n`);
  });
  
  req.setTimeout(5000, () => {
    console.log(`❌ ${test.name}: Request timeout\n`);
    req.destroy();
  });
  
  req.end();
});

console.log('⏳ Waiting for test responses...');