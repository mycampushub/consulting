#!/usr/bin/env node

const http = require('http');

// Test API endpoints for different subdomains
const tests = [
  {
    name: 'Demo Subdomain - Settings API',
    url: 'http://localhost:3000/api/demo/settings'
  },
  {
    name: 'Demo Subdomain - Branches API',
    url: 'http://localhost:3000/api/demo/branches'
  },
  {
    name: 'Demo Subdomain - Workflows API',
    url: 'http://localhost:3000/api/demo/workflows'
  },
  {
    name: 'Test Subdomain - Settings API',
    url: 'http://localhost:3000/api/test/settings'
  },
  {
    name: 'Test Subdomain - Branches API',
    url: 'http://localhost:3000/api/test/branches'
  },
  {
    name: 'Test Subdomain - Workflows API',
    url: 'http://localhost:3000/api/test/workflows'
  }
];

console.log('🌐 Testing API endpoints across different subdomains...\n');

tests.forEach((test, index) => {
  const req = http.request(test.url, {
    headers: {
      'User-Agent': 'Subdomain-Test/1.0'
    }
  }, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 ${test.name}:`);
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      
      try {
        const response = JSON.parse(data);
        if (response.error) {
          console.log(`   ❌ Error: ${response.error}`);
          if (response.details) {
            console.log(`   Details: ${response.details}`);
          }
        } else {
          console.log(`   ✅ Success: ${JSON.stringify(response).substring(0, 100)}...`);
        }
      } catch (e) {
        console.log(`   ⚠️  Raw Response: ${data.substring(0, 100)}...`);
      }
      
      console.log('\n' + '-'.repeat(60) + '\n');
    });
  });
  
  req.on('error', (e) => {
    console.log(`❌ ${test.name}: Failed to connect - ${e.message}\n`);
  });
  
  req.setTimeout(10000, () => {
    console.log(`❌ ${test.name}: Request timeout\n`);
    req.destroy();
  });
  
  req.end();
});

console.log('⏳ Testing subdomain functionality...');