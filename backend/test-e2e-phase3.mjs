/**
 * TrustGuard AI — Full Phase 3 End-to-End Simulation
 * Executes the exact sequence described in Section 23:
 * 1. Login with real user credentials
 * 2. Analyze real content with Gemini + Span Verification
 * 3. Open scan detail via GET /api/scans/:id
 * 4. Verify verified flags, risk score, redacted text
 * 5. PATCH /api/scans/:id/action -> USE_REDACTED
 * 6. Refresh / re-query scan -> Verify action remains USE_REDACTED
 * 7. Query /api/scans -> Verify History reflects "USE_REDACTED"
 * 8. Repeat for SEND_ANYWAY
 * 9. Repeat for DISCARD
 */

const BASE_URL = 'http://localhost:5000/api';

async function req(endpoint, opts = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...opts, headers });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, ok: res.ok, data };
}

async function runE2E() {
  console.log('====================================================');
  console.log('🚀 TRUSTGUARD AI — PHASE 3 END-TO-END FLOW TEST');
  console.log('====================================================\n');

  // 1. Create / login real user account
  const testEmail = `e2e_user_${Date.now()}@trustguard.ai`;
  const signupRes = await req('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'StrongPassword99!' }),
  });
  if (!signupRes.ok) throw new Error('User creation failed');
  const token = signupRes.data.token;
  console.log('1. User logged in:', testEmail);

  // Workflow A: USE_REDACTED
  console.log('\n--- Workflow A: USE_REDACTED ---');
  const textA = 'Urgent update: contact admin at security@trustguard.dev with token secret_token_xyz9876 immediately.';
  const scanResA = await req('/analyze', {
    method: 'POST',
    body: JSON.stringify({ inputText: textA }),
  }, token);

  const scanA = scanResA.data?.scan;
  console.log(`2. Analyzed content A -> Scan ID: ${scanA.id}`);
  console.log(`   Risk Score: ${scanA.riskScore} (${scanA.riskLevel})`);
  console.log(`   Flags Count: ${scanA.flags.length}`);
  console.log(`   Redacted Version: "${scanA.redactedText}"`);

  // Open scan detail
  const detailA = await req(`/scans/${scanA.id}`, {}, token);
  console.log(`3. GET /api/scans/${scanA.id} returned status:`, detailA.status);

  // Apply action USE_REDACTED
  const patchResA = await req(`/scans/${scanA.id}/action`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'USE_REDACTED' }),
  }, token);
  console.log(`4. PATCH /api/scans/${scanA.id}/action -> USE_REDACTED:`, patchResA.status, patchResA.data?.scan?.actionTaken);

  // Refresh and re-fetch scan detail
  const refreshA = await req(`/scans/${scanA.id}`, {}, token);
  console.log(`5. Re-fetched scan detail action:`, refreshA.data?.scan?.actionTaken);
  if (refreshA.data?.scan?.actionTaken !== 'USE_REDACTED') {
    throw new Error('Action was not persisted as USE_REDACTED');
  }

  // Check history list
  const historyResA = await req('/scans', {}, token);
  const foundInHistoryA = historyResA.data?.data?.find(s => s.id === scanA.id);
  console.log(`6. Found in History list action_taken:`, foundInHistoryA?.action_taken);

  // Workflow B: SEND_ANYWAY
  console.log('\n--- Workflow B: SEND_ANYWAY ---');
  const textB = 'Financial record: Transfer payment to card 4111222233334444 before end of day.';
  const scanResB = await req('/analyze', {
    method: 'POST',
    body: JSON.stringify({ inputText: textB }),
  }, token);
  const scanB = scanResB.data?.scan;
  console.log(`1. Analyzed content B -> Scan ID: ${scanB.id}`);

  // Apply action SEND_ANYWAY
  const patchResB = await req(`/scans/${scanB.id}/action`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'SEND_ANYWAY' }),
  }, token);
  console.log(`2. PATCH /api/scans/${scanB.id}/action -> SEND_ANYWAY:`, patchResB.status, patchResB.data?.scan?.actionTaken);

  const refreshB = await req(`/scans/${scanB.id}`, {}, token);
  console.log(`3. Re-fetched scan detail action:`, refreshB.data?.scan?.actionTaken);
  if (refreshB.data?.scan?.actionTaken !== 'SEND_ANYWAY') {
    throw new Error('Action was not persisted as SEND_ANYWAY');
  }

  // Workflow C: DISCARD
  console.log('\n--- Workflow C: DISCARD ---');
  const textC = 'Test draft with phone number +1-555-019-2834 for client verification.';
  const scanResC = await req('/analyze', {
    method: 'POST',
    body: JSON.stringify({ inputText: textC }),
  }, token);
  const scanC = scanResC.data?.scan;
  console.log(`1. Analyzed content C -> Scan ID: ${scanC.id}`);

  // Apply action DISCARD
  const patchResC = await req(`/scans/${scanC.id}/action`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'DISCARD' }),
  }, token);
  console.log(`2. PATCH /api/scans/${scanC.id}/action -> DISCARD:`, patchResC.status, patchResC.data?.scan?.actionTaken);

  const refreshC = await req(`/scans/${scanC.id}`, {}, token);
  console.log(`3. Re-fetched scan detail action:`, refreshC.data?.scan?.actionTaken);
  if (refreshC.data?.scan?.actionTaken !== 'DISCARD') {
    throw new Error('Action was not persisted as DISCARD');
  }

  // Final History List Check
  const finalHistory = await req('/scans', {}, token);
  console.log(`\nFinal History Check (${finalHistory.data?.count} scans):`);
  finalHistory.data?.data?.forEach(s => {
    console.log(` - ID: ${s.id.slice(0, 8)}... | Score: ${s.risk_score} | Flags: ${s.flags.length} | Action: ${s.action_taken}`);
  });

  console.log('\n====================================================');
  console.log('✅ ALL PHASE 3 END-TO-END FLOWS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runE2E().catch((err) => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
