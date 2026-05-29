// test-api.js - Quick API test script
const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log(`\n${method} ${path} => ${res.statusCode}`);
        try { console.log(JSON.stringify(JSON.parse(body), null, 2)); }
        catch { console.log(body); }
        resolve({ status: res.statusCode, data: JSON.parse(body) });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== ResolveX API Tests ===\n');

  // 1. Health check
  await request('GET', '/health');

  // 2. Register with invalid email (should fail)
  await request('POST', '/auth/register', {
    name: 'Test User', email: 'test@gmail.com', password: 'Test1234'
  });

  // 3. Register with valid email
  const reg = await request('POST', '/auth/register', {
    name: 'Rashi Gupta', email: 'rashi@mitsgwl.ac.in', password: 'Test1234'
  });

  // 4. Login with admin (wrong domain - should fail with 403)
  const admin_wrong = await request('POST', '/auth/login', {
    email: 'admin@mitsgwl.ac.in', password: 'Admin@123'
  });

  // 5. Login with wrong password
  await request('POST', '/auth/login', {
    email: 'admin@mitsgwl.ac.in', password: 'wrongpassword'
  });

  console.log('\n=== All tests complete ===');
}

runTests().catch(console.error);
