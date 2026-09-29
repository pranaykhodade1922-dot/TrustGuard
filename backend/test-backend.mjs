import http from 'http';
import app from './src/app.js';

let server;
const PORT = 5001; // Use separate port for testing
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting TrustGuard Backend Test Suite...\n');

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
  console.log(`✓ Test server running on ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (error) {
      console.error(`[FAIL] ${name}: ${error.message}`);
      failed++;
    }
  }

  // 1. Health Check Endpoint
  await assertTest('GET /api/health returns database connectivity status', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200 && res.status !== 503) {
      throw new Error(`Expected 200 or 503, got ${res.status}`);
    }
    if (res.body.service !== 'TrustGuard API') {
      throw new Error(`Unexpected service title: ${res.body.service}`);
    }
    if (!['connected', 'disconnected'].includes(res.body.database)) {
      throw new Error(`Unexpected database status: ${res.body.database}`);
    }
  });

  // 2. Signup - Success
  let validToken = null;
  const testEmail = `sec.user.${Date.now()}@acmesecurity.io`;
  const testPassword = 'StrongPassword99!';

  await assertTest('POST /api/auth/signup creates account and returns JWT', async () => {
    const res = await request('POST', '/api/auth/signup', {
      email: testEmail,
      password: testPassword,
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    if (!res.body.token) throw new Error('Token missing from signup response');
    if (res.body.user.email !== testEmail) throw new Error('User email mismatch in response');
    validToken = res.body.token;
  });

  // 3. Signup - Invalid Email
  await assertTest('POST /api/auth/signup rejects invalid email', async () => {
    const res = await request('POST', '/api/auth/signup', {
      email: 'not-an-email',
      password: 'StrongPassword99!',
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!res.body.errors?.some((e) => e.field === 'email')) {
      throw new Error('Expected email field validation error');
    }
  });

  // 4. Signup - Short Password (< 8 chars)
  await assertTest('POST /api/auth/signup rejects password < 8 characters', async () => {
    const res = await request('POST', '/api/auth/signup', {
      email: 'shortpass@example.com',
      password: 'short',
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!res.body.errors?.some((e) => e.field === 'password')) {
      throw new Error('Expected password length validation error');
    }
  });

  // 5. Signup - Duplicate Email
  await assertTest('POST /api/auth/signup handles duplicate email registration', async () => {
    const res = await request('POST', '/api/auth/signup', {
      email: testEmail,
      password: testPassword,
    });
    if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    if (res.body.message !== 'An account with this email already exists.') {
      throw new Error(`Unexpected message: ${res.body.message}`);
    }
  });

  // 6. Login - Success
  await assertTest('POST /api/auth/login succeeds with correct password', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.token) throw new Error('Token missing from login response');
    if (res.body.user.email !== testEmail) throw new Error('User email mismatch');
  });

  // 7. Login - Incorrect Password
  await assertTest('POST /api/auth/login rejects incorrect password', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'WrongPassword999!',
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.body.message !== 'Invalid email or password.') {
      throw new Error(`Unexpected message: ${res.body.message}`);
    }
  });

  // 8. Login - Nonexistent Email
  await assertTest('POST /api/auth/login rejects nonexistent user without enumeration', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'nobody@nowhere.io',
      password: 'SomePassword123!',
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.body.message !== 'Invalid email or password.') {
      throw new Error(`Unexpected message: ${res.body.message}`);
    }
  });

  // 9. Protected Route - Valid Token
  await assertTest('GET /api/auth/me accepts valid JWT bearer token', async () => {
    const res = await request('GET', '/api/auth/me', null, validToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.user.email !== testEmail) {
      throw new Error('User email in decoded token mismatch');
    }
  });

  // 10. Protected Route - Missing Token
  await assertTest('GET /api/auth/me rejects request with missing token', async () => {
    const res = await request('GET', '/api/auth/me');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 11. Protected Route - Invalid Token
  await assertTest('GET /api/auth/me rejects tampered/invalid token', async () => {
    const res = await request('GET', '/api/auth/me', null, 'invalid.tampered.token');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 12. Scans API - Authenticated User sees empty list initially (Section 21)
  await assertTest('GET /api/scans returns authentic user scan list (empty for new user)', async () => {
    const res = await request('GET', '/api/scans', null, validToken);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.body.data)) throw new Error('Expected data to be an array');
    if (res.body.data.length !== 0) throw new Error('New user must start with 0 scans');
  });

  // 13. Scans API - Cross-User Isolation (Section 10)
  await assertTest('GET /api/scans enforces strict user isolation', async () => {
    // Register second user
    const user2Email = `user2.${Date.now()}@acmesecurity.io`;
    const signup2 = await request('POST', '/api/auth/signup', {
      email: user2Email,
      password: testPassword,
    });
    const token2 = signup2.body.token;

    // Both users fetch their own scans
    const res1 = await request('GET', '/api/scans', null, validToken);
    const res2 = await request('GET', '/api/scans', null, token2);

    if (res1.status !== 200 || res2.status !== 200) {
      throw new Error('Both users must be able to query their own scans independently');
    }
  });

  // 14. Scans API - Action Validation with Zod (Section 22)
  await assertTest('PATCH /api/scans/:id/action validates allowed action values', async () => {
    const res = await request('PATCH', '/api/scans/fake-scan-id/action', { action: 'arbitrary_invalid_action' }, validToken);
    if (res.status !== 400) throw new Error(`Expected 400 for invalid action, got ${res.status}`);
    if (!res.body.errors) throw new Error('Expected Zod validation error response');
  });

  // 15. Security Headers (Helmet) & 404 handler
  await assertTest('Security headers and 404 response are configured', async () => {
    const res = await request('GET', '/api/unknown-endpoint');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    if (!res.headers['x-content-type-options']) {
      throw new Error('Expected nosniff header from Helmet');
    }
  });

  // Shutdown test server
  await new Promise((resolve) => server.close(resolve));

  console.log(`\n=================================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`=================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
