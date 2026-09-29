/**
 * TrustGuard AI — Phase 3 Automated Verification Suite
 * Verifies:
 * 1. Scan Detail Endpoint (GET /api/scans/:id)
 * 2. Mandatory Ownership Isolation Test (Section 17)
 * 3. Strict Zod Action Enum Validation (Section 18)
 * 4. Action Persistence (Section 7, 8, 10, 11, 12)
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🛡️  TRUSTGUARD AI — PHASE 3 AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  }

  // 1. Create User A
  const emailA = `userA_${Date.now()}@trustguard.dev`;
  const resA = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email: emailA, password: 'SecurePassword123!' }),
  });
  assert(resA.status === 201 && resA.data?.token, 'User A Registration', JSON.stringify(resA.data));
  const tokenA = resA.data?.token;

  // 2. Create User B
  const emailB = `userB_${Date.now()}@trustguard.dev`;
  const resB = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email: emailB, password: 'SecurePassword123!' }),
  });
  assert(resB.status === 201 && resB.data?.token, 'User B Registration', JSON.stringify(resB.data));
  const tokenB = resB.data?.token;

  // 3. User A analyzes content (creates Scan A)
  const scanContentA = 'Confidential project details. Email: pranay@trustguard.dev, token: sk-live-abc123xyz456.';
  const analyzeResA = await request('/analyze', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ inputText: scanContentA }),
  });
  assert(
    analyzeResA.status === 200 && analyzeResA.data?.scan?.id,
    'User A creates Scan A',
    JSON.stringify(analyzeResA.data)
  );
  const scanA = analyzeResA.data?.scan;
  const scanIdA = scanA?.id;

  // 4. User B analyzes content (creates Scan B)
  const scanContentB = 'Wire transfer transfer $50,000 to routing number 123456789 immediately.';
  const analyzeResB = await request('/analyze', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ inputText: scanContentB }),
  });
  assert(
    analyzeResB.status === 200 && analyzeResB.data?.scan?.id,
    'User B creates Scan B',
    JSON.stringify(analyzeResB.data)
  );
  const scanB = analyzeResB.data?.scan;
  const scanIdB = scanB?.id;

  console.log('\n--- SECTION 17: MANDATORY OWNERSHIP ISOLATION TESTS ---');

  // Test 1: User A: GET /api/scans/A -> SUCCESS
  const getA_A = await request(`/scans/${scanIdA}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    getA_A.status === 200 && getA_A.data?.scan?.id === scanIdA,
    'User A: GET /api/scans/A -> SUCCESS (200)',
    JSON.stringify(getA_A.data)
  );

  // Test 2: User A: GET /api/scans/B -> 404/403
  const getA_B = await request(`/scans/${scanIdB}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    getA_B.status === 404,
    'User A: GET /api/scans/B -> 404 (Not Found / Access Denied)',
    `Expected 404, got ${getA_B.status}`
  );

  // Test 3: User A: PATCH /api/scans/A/action -> SUCCESS
  const patchA_A = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'USE_REDACTED' }),
  });
  assert(
    patchA_A.status === 200 && patchA_A.data?.scan?.actionTaken === 'USE_REDACTED',
    'User A: PATCH /api/scans/A/action (USE_REDACTED) -> SUCCESS (200)',
    JSON.stringify(patchA_A.data)
  );

  // Test 4: User A: PATCH /api/scans/B/action -> 404/403
  const patchA_B = await request(`/scans/${scanIdB}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'USE_REDACTED' }),
  });
  assert(
    patchA_B.status === 404,
    'User A: PATCH /api/scans/B/action -> 404 (Not Found / Forbidden)',
    `Expected 404, got ${patchA_B.status}`
  );

  // Test 5: User B: GET /api/scans/B -> SUCCESS
  const getB_B = await request(`/scans/${scanIdB}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(
    getB_B.status === 200 && getB_B.data?.scan?.id === scanIdB,
    'User B: GET /api/scans/B -> SUCCESS (200)',
    JSON.stringify(getB_B.data)
  );

  // Test 6: User B: GET /api/scans/A -> 404/403
  const getB_A = await request(`/scans/${scanIdA}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(
    getB_A.status === 404,
    'User B: GET /api/scans/A -> 404 (Not Found / Access Denied)',
    `Expected 404, got ${getB_A.status}`
  );

  // Test 7: User B: PATCH /api/scans/B/action -> SUCCESS
  const patchB_B = await request(`/scans/${scanIdB}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ action: 'SEND_ANYWAY' }),
  });
  assert(
    patchB_B.status === 200 && patchB_B.data?.scan?.actionTaken === 'SEND_ANYWAY',
    'User B: PATCH /api/scans/B/action (SEND_ANYWAY) -> SUCCESS (200)',
    JSON.stringify(patchB_B.data)
  );

  // Test 8: User B: PATCH /api/scans/A/action -> 404/403
  const patchB_A = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ action: 'SEND_ANYWAY' }),
  });
  assert(
    patchB_A.status === 404,
    'User B: PATCH /api/scans/A/action -> 404 (Not Found / Forbidden)',
    `Expected 404, got ${patchB_A.status}`
  );

  console.log('\n--- SECTION 18: STRICT VALIDATION TESTS ---');

  // Valid 1: SEND_ANYWAY
  const valid1 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'SEND_ANYWAY' }),
  });
  assert(valid1.status === 200 && valid1.data?.scan?.actionTaken === 'SEND_ANYWAY', 'Valid action: SEND_ANYWAY (200)');

  // Valid 2: USE_REDACTED
  const valid2 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'USE_REDACTED' }),
  });
  assert(valid2.status === 200 && valid2.data?.scan?.actionTaken === 'USE_REDACTED', 'Valid action: USE_REDACTED (200)');

  // Valid 3: DISCARD
  const valid3 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'DISCARD' }),
  });
  assert(valid3.status === 200 && valid3.data?.scan?.actionTaken === 'DISCARD', 'Valid action: DISCARD (200)');

  // Invalid 1: "send"
  const inv1 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'send' }),
  });
  assert(inv1.status === 400, 'Invalid action: "send" -> 400 Rejected', `Got status ${inv1.status}`);

  // Invalid 2: "DELETE"
  const inv2 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'DELETE' }),
  });
  assert(inv2.status === 400, 'Invalid action: "DELETE" -> 400 Rejected', `Got status ${inv2.status}`);

  // Invalid 3: "APPROVE"
  const inv3 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'APPROVE' }),
  });
  assert(inv3.status === 400, 'Invalid action: "APPROVE" -> 400 Rejected', `Got status ${inv3.status}`);

  // Invalid 4: null
  const inv4 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: null }),
  });
  assert(inv4.status === 400, 'Invalid action: null -> 400 Rejected', `Got status ${inv4.status}`);

  // Invalid 5: empty string
  const inv5 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: '' }),
  });
  assert(inv5.status === 400, 'Invalid action: "" -> 400 Rejected', `Got status ${inv5.status}`);

  // Invalid 6: arbitrary payload "DELETE_ALL_DATA"
  const inv6 = await request(`/scans/${scanIdA}/action`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ action: 'DELETE_ALL_DATA' }),
  });
  assert(inv6.status === 400, 'Invalid action: "DELETE_ALL_DATA" -> 400 Rejected', `Got status ${inv6.status}`);

  console.log('\n--- SECTION 7 & 8: PERSISTENCE VERIFICATION ---');

  // Verify Scan A persisted action
  const finalGetA = await request(`/scans/${scanIdA}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    finalGetA.status === 200 && finalGetA.data?.scan?.actionTaken === 'DISCARD',
    'Persisted Scan A Action is DISCARD',
    JSON.stringify(finalGetA.data?.scan)
  );

  // Verify Scan B persisted action
  const finalGetB = await request(`/scans/${scanIdB}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(
    finalGetB.status === 200 && finalGetB.data?.scan?.actionTaken === 'SEND_ANYWAY',
    'Persisted Scan B Action is SEND_ANYWAY',
    JSON.stringify(finalGetB.data?.scan)
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
