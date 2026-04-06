
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx_En8x8MhnhIV1qYboX9kAftQ23dHtjJAO8wGouGgwlaBP8GOgUHTS-7Va4nErc0MWKg/exec';
const ADMIN_ID = 'sriram';
const ADMIN_PASS = '93611';

// Custom logger to capture output
const logEntries = [];
function log(msg) { 
  const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(entry); 
  logEntries.push(entry);
}

async function runTests() {
  log("🚀 STARTING FINAL PRODUCTION AUDIT TESTS...");

  // 1. EMERGENCY MODE TEST
  log("🧪 TEST 3: Emergency Mode Validation...");
  // Enable
  let emOn = await fetch(SHEETS_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: 'setEmergency', enabled: true, uid: ADMIN_ID, pwd: ADMIN_PASS }) 
  }).then(r => r.json());
  log(`Emergency Mode ON: ${emOn.success}`);
  
  // Wait for propagation
  await new Promise(r => setTimeout(r, 2000));

  // Attempt Reg while ON
  let regFail = await fetch(SHEETS_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: 'addReg', data: { regId: 'EM_TEST', name: 'Emergency Student', regno: '0000001', eventName: 'Hackverse' } }) 
  }).then(r => r.json());
  
  const emBlocked = !regFail.success;
  log(`Registration during Emergency: ${emBlocked ? 'SUCCESS (Blocked correctly)' : 'FAIL (Should not be possible)'} - Msg: ${regFail.error || 'N/A'}`);

  // Disable
  await fetch(SHEETS_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: 'setEmergency', enabled: false, uid: ADMIN_ID, pwd: ADMIN_PASS }) 
  });
  log("Emergency Mode DISABLED.");

  // 2. RECOVERY TEST (Team Member Lookup)
  log("\n🧪 TEST 4: Recovery Logic for Team Members...");
  const teamRegId = 'T_' + Date.now();
  await fetch(SHEETS_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: 'addReg', data: { 
      regId: teamRegId, name: 'Team Leader', regno: '1111111', eventName: 'Hackverse', teamName: 'StressTeam',
      teamMembers: [{ name: 'Member Alpha', regno: '2222222' }]
    } }) 
  }).then(r => r.json());
  
  let recovery = await fetch(SHEETS_URL + '?action=lookup&fetchRegno=2222222').then(r => r.json());
  log(`Recovery of Team Pass via Member RegNo (2222222): ${recovery.found ? 'SUCCESS' : 'FAILED'}`);

  // 3. SCAN LOOP TEST (Idempotency)
  log("\n🧪 TEST 2: Scan Identification Idempotency...");
  const scanData = { action: 'handleScan', uid: ADMIN_ID, pwd: ADMIN_PASS, data: { regId: teamRegId, name: 'Team Leader', regno: '1111111', eventName: 'Hackverse', teamName: 'StressTeam', scannerId: 'audit_bot' } };
  
  let scan1 = await fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(scanData) }).then(r => r.json());
  log(`Scan 1: ${scan1.success ? 'SUCCESS' : 'FAILED (' + scan1.error + ')'}`);

  let scan2 = await fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(scanData) }).then(r => r.json());
  log(`Scan 2 (Idempotency check): ${scan2.success ? 'FAIL (Duplicate Accepted!)' : 'SUCCESS (Rejected correctly: ' + scan2.error + ')'}`);

  // 4. STRESS TEST (50 Concurrent Registrations)
  log("\n🧪 TEST 1: Stress Test (50 Concurrent Registrations)...");
  log("Hammering Google Apps Script with 50 simultaneous POSTs...");
  
  const startTime = Date.now();
  const requests = [];
  for(let i = 1; i <= 50; i++) {
    const id = `STRESS_${i}_${Date.now()}`;
    const rn = `500000${i}`;
    requests.push(fetch(SHEETS_URL, { 
      method: 'POST', 
      body: JSON.stringify({ action: 'addReg', data: { regId: id, name: `Stress Student ${i}`, regno: rn, eventName: 'Brand to Billion' } }) 
    }).then(r => r.json().catch(e => ({ success: false, error: 'Parse Error' }))));
  }

  const results = await Promise.all(requests);
  const duration = (Date.now() - startTime) / 1000;
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const rateLimited = results.filter(r => r.error === 'RATE_LIMIT').length;
  const serverBusy = results.filter(r => r.error && r.error.includes('Server busy')).length;

  log(`✅ Results: ${passed} Passed, ${failed} Failed`);
  log(`📊 Breakdown: ${rateLimited} Rate Limited (Expected), ${serverBusy} Server Busy Locks (Expected under high load)`);
  log(`⏱️ Duration: ${duration} seconds`);

  log("\n🏁 ALL TESTS COMPLETED.");
}

runTests().catch(console.error);
