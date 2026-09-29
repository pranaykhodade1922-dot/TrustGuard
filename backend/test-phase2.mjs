import http from 'http';
import app from './src/app.js';
import { spanVerifier } from './src/services/spanVerifier.js';

let server;
const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(endpoint, options = {}, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, data };
}

async function runPhase2Tests() {
  console.log('======================================================');
  console.log('🧪 TRUSTGUARD AI — PHASE 2 ANALYSIS ENGINE TEST SUITE');
  console.log('======================================================\n');

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });
  console.log(`✓ Test server running on http://localhost:${PORT}\n`);

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

  // Setup: Register Test User A
  const userAEmail = `user.a.${Date.now()}@trustguard.ai`;
  const signupA = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email: userAEmail, password: 'SecurePassword123!' }),
  });
  const tokenA = signupA.data?.token;

  // Setup: Register Test User B
  const userBEmail = `user.b.${Date.now()}@trustguard.ai`;
  const signupB = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email: userBEmail, password: 'SecurePassword123!' }),
  });
  const tokenB = signupB.data?.token;

  let scanAId = null;
  let scanBId = null;

  // TEST 1: Clean text
  await assertTest('TEST 1: Clean text returns low risk and zero flags', async () => {
    const res = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({
        inputText: 'Hi team, please find attached the agenda for our weekly product design sync tomorrow morning.',
      }),
    }, tokenA);

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data?.scan?.riskScore !== 0) throw new Error(`Expected riskScore 0, got ${res.data?.scan?.riskScore}`);
    if (res.data?.scan?.riskLevel !== 'LOW') throw new Error(`Expected LOW riskLevel, got ${res.data?.scan?.riskLevel}`);
    if (res.data?.scan?.flags?.length !== 0) throw new Error(`Expected 0 flags, got ${res.data?.scan?.flags?.length}`);
    if (res.data?.scan?.redactedText.includes('[REDACTED]')) throw new Error('Clean text must not be redacted');
  });

  // TEST 2: Email + phone
  await assertTest('TEST 2: Email and phone detected, verified, and redacted', async () => {
    const raw = 'Please contact support at alice@example.com or phone +1-555-839-2041 for help.';
    const res = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: raw }),
    }, tokenA);

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const flags = res.data?.scan?.flags || [];
    const hasEmail = flags.some((f) => f.span === 'alice@example.com' && f.category === 'PII');
    const hasPhone = flags.some((f) => f.span.includes('555-839-2041') && f.category === 'PII');
    if (!hasEmail) throw new Error('Missing verified email flag');
    if (!hasPhone) throw new Error('Missing verified phone flag');
    if (!res.data?.scan?.redactedText.includes('[REDACTED]')) throw new Error('Expected redacted text');
  });

  // TEST 3: Sensitive ID-like value (Aadhaar / SSN)
  await assertTest('TEST 3: National identity record detected with exact span redaction', async () => {
    const raw = 'Verification document: Aadhaar identifier 4829-1920-1234 on file.';
    const res = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: raw }),
    }, tokenA);

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const flags = res.data?.scan?.flags || [];
    const hasAadhaar = flags.some((f) => f.span === '4829-1920-1234');
    if (!hasAadhaar) throw new Error('Aadhaar number not detected');
    if (!res.data?.scan?.redactedText.includes('Verification document: Aadhaar identifier [REDACTED] on file.')) {
      throw new Error(`Unexpected redacted output: ${res.data?.scan?.redactedText}`);
    }
  });

  // TEST 4: Credential / API key shaped string
  await assertTest('TEST 4: API key credential detected and redacted', async () => {
    const raw = 'Authorization: Bearer sk-proj-9xLkM3n0P1qRsTuVwXyZ8aBcDeFgHiJkLmNoPqRsTuVw for external query.';
    const res = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: raw }),
    }, tokenA);

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const flags = res.data?.scan?.flags || [];
    const hasKey = flags.some((f) => f.category === 'CREDENTIAL' && f.span.includes('sk-proj-'));
    if (!hasKey) throw new Error('API key not detected as CREDENTIAL');
    if (res.data?.scan?.riskScore < 50) throw new Error('Credential exposure must result in high risk score');
    if (!res.data?.scan?.redactedText.includes('[REDACTED]')) throw new Error('API key was not redacted');
  });

  // TEST 5: Social engineering
  await assertTest('TEST 5: Social engineering urgency and OTP solicitation detected', async () => {
    const raw = 'Your account will be closed today unless you verify your access within 30 minutes. Send your OTP immediately.';
    const res = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: raw }),
    }, tokenA);

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const flags = res.data?.scan?.flags || [];
    const hasSocEng = flags.some((f) => f.category === 'SOCIAL_ENGINEERING');
    if (!hasSocEng) throw new Error('Expected SOCIAL_ENGINEERING category in flags');
    if (res.data?.scan?.riskLevel !== 'CRITICAL' && res.data?.scan?.riskLevel !== 'HIGH') {
      throw new Error(`Expected HIGH or CRITICAL risk, got ${res.data?.scan?.riskLevel}`);
    }
  });

  // TEST 6: Mixed content (Sensitive data + suspicious request)
  await assertTest('TEST 6: Mixed content correctly identifies multiple distinct risk categories', async () => {
    const raw = 'URGENT SECURITY NOTICE FROM IT HELPDESK: Send your OTP immediately to verify your email admin@megacorp.internal and bank account 928102938192.';
    const res = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: raw }),
    }, tokenA);

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const flags = res.data?.scan?.flags || [];
    const categories = new Set(flags.map((f) => f.category));
    if (!categories.has('SOCIAL_ENGINEERING') || !categories.has('PII')) {
      throw new Error(`Expected multiple categories, got: ${Array.from(categories).join(', ')}`);
    }
    scanAId = res.data?.scan?.id;
  });

  // TEST 7: Hallucinated AI span rejection
  await assertTest('TEST 7: Exact-span verification strictly rejects hallucinated spans', async () => {
    const inputText = 'The user email is legitimate@trustguard.ai.';
    const hallucinatedCandidate = [
      { span: 'legitimate@trustguard.ai', category: 'PII', reason: 'Real span' },
      { span: 'hallucinated@fakedomain.org', category: 'PII', reason: 'Hallucinated span' },
      { span: 'legitimate@gmail.com', category: 'PII', reason: 'Altered span' },
    ];

    const verified = spanVerifier.verifySpans(hallucinatedCandidate, inputText);
    if (verified.length !== 1) {
      throw new Error(`Expected exactly 1 verified span, got ${verified.length}`);
    }
    if (verified[0].span !== 'legitimate@trustguard.ai') {
      throw new Error(`Unexpected span preserved: ${verified[0].span}`);
    }
  });

  // TEST 8: Empty input validation (Expected 400)
  await assertTest('TEST 8: Empty or whitespace-only input returns HTTP 400', async () => {
    const res1 = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: '' }),
    }, tokenA);
    if (res1.status !== 400) throw new Error(`Expected 400, got ${res1.status}`);

    const res2 = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: '   \n  \t  ' }),
    }, tokenA);
    if (res2.status !== 400) throw new Error(`Expected 400 for whitespace, got ${res2.status}`);
  });

  // TEST 9: No JWT authentication (Expected 401)
  await assertTest('TEST 9: Missing JWT bearer token returns HTTP 401', async () => {
    const res = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: 'Some text to analyze without auth.' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // TEST 10: Strict User Isolation
  await assertTest('TEST 10: Complete user isolation — User A cannot access User B scans', async () => {
    // User B creates Scan B
    const resB = await request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ inputText: 'Confidential client payment to UPI test@okhdfcbank.' }),
    }, tokenB);
    scanBId = resB.data?.scan?.id;

    if (!scanAId || !scanBId) {
      throw new Error('Both scans must exist to test cross-user isolation');
    }

    // User A attempts to read User B's scan
    const alienRead = await request(`/scans/${scanBId}`, {}, tokenA);
    if (alienRead.status !== 404) {
      throw new Error(`Expected 404 for alien scan lookup, got ${alienRead.status}`);
    }

    // User B attempts to read User A's scan
    const alienReadReverse = await request(`/scans/${scanAId}`, {}, tokenB);
    if (alienReadReverse.status !== 404) {
      throw new Error(`Expected 404 for alien scan lookup, got ${alienReadReverse.status}`);
    }

    // User A lists their scans -> must NOT contain scanBId
    const listA = await request('/scans', {}, tokenA);
    const hasScanBInA = listA.data?.data?.some((s) => s.id === scanBId);
    if (hasScanBInA) {
      throw new Error('User A history leaked User B scan!');
    }

    // User B lists their scans -> must NOT contain scanAId
    const listB = await request('/scans', {}, tokenB);
    const hasScanAInB = listB.data?.data?.some((s) => s.id === scanAId);
    if (hasScanAInB) {
      throw new Error('User B history leaked User A scan!');
    }
  });

  // Shutdown test server
  await new Promise((resolve) => server.close(resolve));

  console.log(`\n======================================================`);
  console.log(`Phase 2 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
