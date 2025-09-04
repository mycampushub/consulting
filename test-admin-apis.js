const fetch = require('node-fetch');

async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Admin API Endpoints...\n');
  
  // Test agencies endpoint
  try {
    console.log('1. Testing /api/admin/agencies...');
    const response = await fetch(`${baseUrl}/api/admin/agencies`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Agencies endpoint working\n');
  } catch (error) {
    console.log('❌ Agencies endpoint failed:', error.message);
  }
  
  // Test monitoring endpoint
  try {
    console.log('2. Testing /api/admin/monitoring?type=overview...');
    const response = await fetch(`${baseUrl}/api/admin/monitoring?type=overview`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Monitoring endpoint working\n');
  } catch (error) {
    console.log('❌ Monitoring endpoint failed:', error.message);
  }
  
  // Test health endpoint
  try {
    console.log('3. Testing /api/admin/health...');
    const response = await fetch(`${baseUrl}/api/admin/health`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Health endpoint working\n');
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }
}

testAPIs().catch(console.error);