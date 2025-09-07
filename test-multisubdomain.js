#!/usr/bin/env node

const http = require('http');

// Test API endpoints for multiple subdomains
const tests = [
  {
    name: 'Demo Settings API',
    url: 'http://localhost:3000/api/demo/settings'
  },
  {
    name: 'Demo Branches API', 
    url: 'http://localhost:3000/api/demo/branches'
  },
  {
    name: 'TestAgency Settings API',
    url: 'http://localhost:3000/api/testagency/settings'
  },
  {
    name: 'TestAgency Branches API',
    url: 'http://localhost:3000/api/testagency/branches'
  },
  {
    name: 'MyCampus Settings API',
    url: 'http://localhost:3000/api/mycampus/settings'
  },
  {
    name: 'MyCampus Branches API',
    url: 'http://localhost:3000/api/mycampus/branches'
  }
];

console.log('🌐 Testing API endpoints for multiple subdomains...\n');

tests.forEach((test, index) => {
  const req = http.request(test.url, {
    headers: {
      'User-Agent': 'MultiSubdomain-Test/1.0'
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
        } else {
          console.log(`   ✅ Success: ${response.name || response.subdomain || 'Data loaded'}`);
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

console.log('⏳ Testing multiple subdomains...');