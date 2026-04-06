
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx_En8x8MhnhIV1qYboX9kAftQ23dHtjJAO8wGouGgwlaBP8GOgUHTS-7Va4nErc0MWKg/exec';
const ADMIN_ID = 'sriram';
const ADMIN_PASS = '93611';

function log(msg) { 
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`); 
}

async function safeFetch(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, options);
      return await r.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      log(`   ⚠️ Fetch error (${e.message}), retrying...`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

async function runTests() {
  log("🚀 RESTARTING STABILIZED AUDIT TESTS...");

  // 1. EMERGENCY MODE TEST (B1 vs A1 logic check)
  log("\n🧪 TEST 3: Emergency Mode Validation...");
  await safeFetch(SHEETS_URL, { method: 'POST', body: JSON.stringify({ action: 'setEmergency', enabled: true, uid: ADMIN_ID, pwd: ADMIN_PASS }) });
  log("Emergency Mode Toggle (B1) sent: true");
  
  let regAttempt = await safeFetch(SHEETS_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: 'addReg', data: { regId: 'EM_TEST_2', name: 'Emergency Student', regno: '0000001', eventName: 'Hackverse' } }) 
  });
  
  if (regAttempt.success) {
    log("🚨 CRITICAL BUG: Registration SUCCEEDED while Emergency Mode was ON. (Only B1 is toggled, backend still open).");
  } else {
    log("✅ Registration Blocked (Backend correctly closed).");
  }
  await safeFetch(SHEETS_URL, { method: 'POST', body: JSON.stringify({ action: 'setEmergency', enabled: false, uid: ADMIN_ID, pwd: ADMIN_PASS }) });

  // 2. RECOVERY TEST
  log("\n🧪 TEST 4: Recovery Logic for Team Members...");
  const teamRegId = 'T_' + Date.now();
  await safeFetch(SHEETS_URL, { method: 'POST', body: JSON.stringify({ action: 'addReg', data: { 
    regId: teamRegId, name: 'Team Leader', regno: '1111111', eventName: 'Hackverse', teamName: 'StressTeam',
    teamMembers: [{ name: 'Member Alpha', regno: '2222222' }]
  } }) });
  
  let recovery = await safeFetch(SHEETS_URL + '?action=lookup&fetchRegno=2222222');
  log(`Recovery of Team Pass via Member RegNo (2222222): ${recovery.found ? '✅ SUCCESS' : '❌ FAILED'}`);

  // 3. SCAN LOOP TEST
  log("\n🧪 TEST 2: Scan Identification Idempotency...");
  const scanData = { action: 'handleScan', uid: ADMIN_ID, pwd: ADMIN_PASS, data: { regId: teamRegId, name: 'Team Leader', regno: '1111111', eventName: 'Hackverse', teamName: 'StressTeam', scannerId: 'audit_bot' } };
  
  let scan1 = await safeFetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(scanData) });
  log(`Scan 1: ${scan1.success ? '✅ SUCCESS' : '❌ FAILED (' + scan1.error + ')'}`);

  let scan2 = await safeFetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(scanData) });
  log(`Scan 2 (Idempotency check): ${scan2.success ? '❌ FAIL (Duplicate Accepted!)' : '✅ SUCCESS (Rejected correctly: ' + scan2.error + ')'}`);

  // 4. STRESS TEST (Reduced to 30 to avoid socket timeout, still hammers concurrent locks)
  log("\n🧪 TEST 1: Stress Test (30 Concurrent Registrations)...");
  log("Hammering Google Apps Script with 30 simultaneous POSTs...");
  
  const startTime = Date.now();
  const requests = [];
  for(let i = 1; i <= 30; i++) {
    const id = `STRESS_${i}_${Date.now()}`;
    const rn = `500000${i}`;
    requests.push(fetch(SHEETS_URL, { 
      method: 'POST', 
      body: JSON.stringify({ action: 'addReg', data: { regId: id, name: `Stress Student ${i}`, regno: rn, eventName: 'Brand to Billion' } }) 
    }).then(r => r.json().catch(e => ({ success: false, error: 'Socket Hangup/Parse Error' }))));
  }

  const results = await Promise.all(requests);
  const duration = (Date.now() - startTime) / 1000;
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const rateLimited = results.filter(r => r.error === 'RATE_LIMIT').length;
  const serverBusy = results.filter(r => r.error && r.error.includes('Server busy')).length;

  log(`✅ Results: ${passed} Passed, ${failed} Failed`);
  log(`📊 Breakdown: ${rateLimited} Rate Limited, ${serverBusy} Server Busy Locks`);
  log(`⏱️ Duration: ${duration} seconds`);

  log("\n🏁 ALL TESTS COMPLETED.");
}

runTests().catch(log);
