// ══════════════════════════════════════════
// UTSAV 2K26 — Google Apps Script (v4 - Auto Align)
// ══════════════════════════════════════════
// INSTRUCTIONS:
// 1. Open your Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete ALL existing code
// 4. Paste THIS entire file
// 5. Click Deploy → Manage Deployments → Edit (pencil icon)
//    → Set Version to "New version" → Deploy
// ══════════════════════════════════════════

// The exact column structure you need, with Gender at the very end. 
// The script will automatically fix your Sheet's header row to match this!
var OFFICIAL_HEADERS = ["RegID", "Name", "RegNo", "Year", "Section", "Phone", "Email", "Event", "TeamName", "TeamMembers", "Timestamp", "Gender"];
var SCAN_HEADERS = ["RegID", "Name", "RegNo", "Event", "TeamName", "Timestamp", "ScannerID"];

function enforceHeaders(sh) {
  var headers = sh.getName() === "Scans" ? SCAN_HEADERS : OFFICIAL_HEADERS;
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  var lc = sh.getLastColumn();
  if (lc > headers.length) {
    sh.getRange(1, headers.length + 1, sh.getMaxRows(), lc - headers.length).clearContent();
  }
}

// ── GET requests (Admin Panel + Fetch Pass) ──
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Registrations");
  if (!sh) return ContentService.createTextOutput(JSON.stringify({ found: false, registrations: [] })).setMimeType(ContentService.MimeType.JSON);

  enforceHeaders(sh); // Auto-fix alignment immediately
  var action = (e.parameter.action || "").trim();

  if (action === "adminLogin") {
    var uid = (e.parameter.uid || "").trim();
    var pwd = (e.parameter.pwd || "").trim();
    if (uid === "sriram" && pwd === "93611") {
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid credentials" })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ── Emergency Mode Status Check (public, lightweight) ──
  if (action === "getEmergencyStatus") {
    var configSh = ss.getSheetByName("Config");
    var emergency = false;
    if (configSh) {
      var val = String(configSh.getRange("B1").getValue()).toUpperCase().trim();
      emergency = (val === "EMERGENCY_ON");
    }
    return ContentService.createTextOutput(JSON.stringify({ emergency: emergency })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getRegs") {
    var data = sh.getDataRange().getValues();
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ registrations: [] })).setMimeType(ContentService.MimeType.JSON);

    var headers = OFFICIAL_HEADERS;
    var results = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var teamMembersRaw = row[headers.indexOf("TeamMembers")] || "[]";
      var teamMembers = [];
      try { teamMembers = JSON.parse(teamMembersRaw); } catch (ex) { teamMembers = []; }
      results.push({
        regId: String(row[headers.indexOf("RegID")] || ""),
        name: String(row[headers.indexOf("Name")] || ""),
        regno: String(row[headers.indexOf("RegNo")] || ""),
        year: String(row[headers.indexOf("Year")] || ""),
        section: String(row[headers.indexOf("Section")] || ""),
        phone: String(row[headers.indexOf("Phone")] || ""),
        email: String(row[headers.indexOf("Email")] || ""),
        gender: String(row[headers.indexOf("Gender")] || ""),
        eventId: "", // EventID column removed to match your exact sheet
        eventName: String(row[headers.indexOf("Event")] || ""),
        teamName: String(row[headers.indexOf("TeamName")] || ""),
        teamMembers: teamMembers,
        ts: String(row[headers.indexOf("Timestamp")] || "")
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ registrations: results })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "lookup") {
    var email = (e.parameter.email || "").toLowerCase().trim();
    if (!email) return ContentService.createTextOutput(JSON.stringify({ found: false, registrations: [] })).setMimeType(ContentService.MimeType.JSON);

    var checkEventId = e.parameter.eventId || ""; // Using eventName fallback below
    var checkEventName = (e.parameter.eventName || "").trim();
    var checkRegNosStr = e.parameter.regnos || "";
    var checkRegNos = checkRegNosStr ? checkRegNosStr.split(",").map(function (r) { return r.trim().toLowerCase(); }) : [];
    var checkTimeSlot = (e.parameter.timeSlot || "").trim();

    var duplicates = [];
    var duplicateDetails = [];
    var timeSlotConflicts = [];
    var timeSlotConflictDetails = [];

    var data = sh.getDataRange().getValues();
    var headers = OFFICIAL_HEADERS;
    var results = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowEmail = String(row[headers.indexOf("Email")] || "").toLowerCase().trim();
      var rowEventName = String(row[headers.indexOf("Event")] || "").trim();
      var teamMembersRaw = row[headers.indexOf("TeamMembers")] || "[]";
      var teamMembers = [];
      try { teamMembers = JSON.parse(teamMembersRaw); } catch (ex) { }

      if (email && rowEmail === email) {
        results.push({
          regId: String(row[headers.indexOf("RegID")] || ("GF-" + (i + 1))),
          name: String(row[headers.indexOf("Name")] || ""),
          regno: String(row[headers.indexOf("RegNo")] || ""),
          gender: String(row[headers.indexOf("Gender")] || ""),
          year: String(row[headers.indexOf("Year")] || ""),
          section: String(row[headers.indexOf("Section")] || ""),
          phone: String(row[headers.indexOf("Phone")] || ""),
          email: rowEmail,
          eventId: "",
          eventName: rowEventName,
          teamName: String(row[headers.indexOf("TeamName")] || ""),
          teamMembers: teamMembers,
          ts: String(row[headers.indexOf("Timestamp")] || "")
        });
      }

      // Look for duplicate register numbers for the SAME EVENT name
      if (checkEventName && rowEventName.toLowerCase() === checkEventName.toLowerCase() && checkRegNos.length > 0) {
        var rowLeaderRegNo = String(row[headers.indexOf("RegNo")] || "").trim().toLowerCase();
        var rowLeaderName = String(row[headers.indexOf("Name")] || "");

        if (checkRegNos.indexOf(rowLeaderRegNo) !== -1) {
          if (duplicates.indexOf(rowLeaderRegNo) === -1) {
            duplicates.push(rowLeaderRegNo);
            duplicateDetails.push({ name: rowLeaderName, regno: rowLeaderRegNo });
          }
        }

        for (var j = 0; j < teamMembers.length; j++) {
          var tmRegNo = String(teamMembers[j].regno || "").trim().toLowerCase();
          if (tmRegNo && checkRegNos.indexOf(tmRegNo) !== -1) {
            if (duplicates.indexOf(tmRegNo) === -1) {
              duplicates.push(tmRegNo);
              duplicateDetails.push({ name: teamMembers[j].name || "Team Member", regno: tmRegNo });
            }
          }
        }
      }

      // Check for Cross-Event Time Slot conflicts
      // If the incoming event has a timeSlot (e.g., 'A'), and the row event shares the same timeSlot, AND it's a DIFFERENT event
      if (checkTimeSlot && checkRegNos.length > 0) {
        // We need a map of which events are in which time slots to know if rowEventName belongs to checkTimeSlot
        var EVENT_SLOTS = {
          "hackverse": "A",
          "zero code zone": "A",
          "brand to billion": "B",
          "clash of minds": "B"
        };
        var rowSlot = EVENT_SLOTS[rowEventName.toLowerCase()];

        if (rowSlot === checkTimeSlot && rowEventName.toLowerCase() !== checkEventName.toLowerCase()) {
          var rowLeaderRegNo = String(row[headers.indexOf("RegNo")] || "").trim().toLowerCase();
          var rowLeaderName = String(row[headers.indexOf("Name")] || "");

          if (checkRegNos.indexOf(rowLeaderRegNo) !== -1) {
            if (timeSlotConflicts.indexOf(rowLeaderRegNo) === -1) {
              timeSlotConflicts.push(rowLeaderRegNo);
              timeSlotConflictDetails.push({ name: rowLeaderName, regno: rowLeaderRegNo, conflictingEvent: rowEventName });
            }
          }

          for (var j = 0; j < teamMembers.length; j++) {
            var tmRegNo = String(teamMembers[j].regno || "").trim().toLowerCase();
            if (tmRegNo && checkRegNos.indexOf(tmRegNo) !== -1) {
              if (timeSlotConflicts.indexOf(tmRegNo) === -1) {
                timeSlotConflicts.push(tmRegNo);
                timeSlotConflictDetails.push({ name: teamMembers[j].name || "Team Member", regno: tmRegNo, conflictingEvent: rowEventName });
              }
            }
          }
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      found: results.length > 0,
      registrations: results,
      duplicates: duplicates,
      duplicateDetails: duplicateDetails,
      timeSlotConflicts: timeSlotConflicts,
      timeSlotConflictDetails: timeSlotConflictDetails
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "lookupScan") {
    var regId = (e.parameter.regId || "").trim();
    if (!regId) return ContentService.createTextOutput(JSON.stringify({ success: false })).setMimeType(ContentService.MimeType.JSON);

    // 1. Check Scan Status
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var scansSh = ss.getSheetByName("Scans") || ss.insertSheet("Scans");
    enforceHeaders(scansSh);
    var scanData = scansSh.getDataRange().getValues();
    var scanInfo = null;
    for (var i = 1; i < scanData.length; i++) {
      if (String(scanData[i][0]) === regId) {
        scanInfo = { timestamp: scanData[i][5], scannerId: scanData[i][6] };
        break;
      }
    }

    // 2. Fetch Participant Details ONLY if not found in cache
    var participant = null;
    var regSh = ss.getSheetByName("Registrations");
    if (regSh) {
      var regIds = regSh.getRange(1, 1, regSh.getLastRow(), 1).getValues();
      var rowIndex = -1;
      for (var i = 0; i < regIds.length; i++) {
        if (String(regIds[i][0]) === regId) { rowIndex = i + 1; break; }
      }

      if (rowIndex !== -1) {
        var row = regSh.getRange(rowIndex, 1, 1, regSh.getLastColumn()).getValues()[0];
        var headers = OFFICIAL_HEADERS;
        var teamMembersRaw = row[headers.indexOf("TeamMembers")] || "[]";
        var teamMembers = [];
        try { teamMembers = JSON.parse(teamMembersRaw); } catch (ex) { }
        participant = {
          regId: String(row[headers.indexOf("RegID")]),
          name: String(row[headers.indexOf("Name")]),
          regno: String(row[headers.indexOf("RegNo")]),
          year: String(row[headers.indexOf("Year")]),
          section: String(row[headers.indexOf("Section")]),
          phone: String(row[headers.indexOf("Phone")]),
          eventName: String(row[headers.indexOf("Event")]),
          teamName: String(row[headers.indexOf("TeamName")]),
          teamMembers: teamMembers
        };
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      isAlreadyScanned: (scanInfo !== null),
      scanInfo: scanInfo,
      participant: participant
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "lookupTeamStatus") {
    var regId = (e.parameter.regId || "").trim();
    if (!regId) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Missing regId" })).setMimeType(ContentService.MimeType.JSON);

    var participant = null;
    var regIds = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
    var rowIndex = -1;
    for (var i = 0; i < regIds.length; i++) {
      if (String(regIds[i][0]) === regId) { rowIndex = i + 1; break; }
    }
    if (rowIndex === -1) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Registration not found" })).setMimeType(ContentService.MimeType.JSON);

    var row = sh.getRange(rowIndex, 1, 1, sh.getLastColumn()).getValues()[0];
    var headers = OFFICIAL_HEADERS;
    var teamMembersRaw = row[headers.indexOf("TeamMembers")] || "[]";
    var teamMembers = [];
    try { if (teamMembersRaw !== "Solo") teamMembers = JSON.parse(teamMembersRaw); } catch (ex) { }

    participant = {
      regId: String(row[headers.indexOf("RegID")]),
      name: String(row[headers.indexOf("Name")]),
      regno: String(row[headers.indexOf("RegNo")]),
      year: String(row[headers.indexOf("Year")]),
      section: String(row[headers.indexOf("Section")]),
      phone: String(row[headers.indexOf("Phone")]),
      email: String(row[headers.indexOf("Email")]),
      eventName: String(row[headers.indexOf("Event")]),
      teamName: String(row[headers.indexOf("TeamName")]),
      teamMembers: teamMembers
    };

    var enteredIndices = [];
    var scansSh = ss.getSheetByName("Scans");
    var totalMembers = 1 + teamMembers.length;
    if (scansSh && scansSh.getLastRow() > 1) {
      var scanIds = scansSh.getRange(2, 1, scansSh.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < scanIds.length; i++) {
        var sid = String(scanIds[i][0]);
        if (sid === regId) {
          enteredIndices = [];
          for (var j = 0; j < totalMembers; j++) enteredIndices.push(j);
          break;
        }
        if (sid.indexOf(regId + "_M") === 0) {
          var mIdx = parseInt(sid.substring((regId + "_M").length));
          if (!isNaN(mIdx) && enteredIndices.indexOf(mIdx) === -1) enteredIndices.push(mIdx);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true, participant: participant, enteredIndices: enteredIndices, totalMembers: totalMembers
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ found: false, registrations: [] })).setMimeType(ContentService.MimeType.JSON);
}

// ── POST requests (Save registrations) ──
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // MASTER SWITCH CHECK (Remote Control)
    // To close registrations instantly: Create a sheet named 'Config' and write 'CLOSED' in cell A1.
    var configSh = ss.getSheetByName("Config");
    if (configSh) {
      var status = String(configSh.getRange("A1").getValue()).toUpperCase().trim();
      if (status === "CLOSED") {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Registrations are currently closed by the administrator." })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var contents = e.postData.contents;
    var d = JSON.parse(contents);

    // ── Emergency Mode Toggle (requires admin auth) ──
    if (d.action === "setEmergency") {
      if (d.uid !== "sriram" || d.pwd !== "93611") {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
      }
      var configSh = ss.getSheetByName("Config") || ss.insertSheet("Config");
      configSh.getRange("B1").setValue(d.enabled ? "EMERGENCY_ON" : "");
      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ success: true, emergency: !!d.enabled })).setMimeType(ContentService.MimeType.JSON);
    }

    // Optimized Scan Handle (Fast execution, localized lock, duplicate prevention)
    if (d.action === "handleScan") {
      var scanLock = LockService.getScriptLock();
      if (!scanLock.tryLock(8000)) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "System busy. Please scan again." })).setMimeType(ContentService.MimeType.JSON);
      try {
        var r = d.data;
        var regId = String(r.regId);
        
        // --- TURBO CACHE CHECK ---
        var cache = CacheService.getScriptCache();
        if (cache.get("scan_" + regId)) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Pass Already Scanned!" })).setMimeType(ContentService.MimeType.JSON);
        }

        var scansSh = ss.getSheetByName("Scans") || ss.insertSheet("Scans");
        if (scansSh.getLastRow() === 0) enforceHeaders(scansSh);
        
        // Safety Fallback: Check sheet if cache is empty but sheet isn't
        if (scansSh.getLastRow() > 1) {
           var scanIds = scansSh.getRange(2, 1, Math.min(scansSh.getLastRow() - 1, 1000), 1).getValues();
           for (var idx = 0; idx < scanIds.length; idx++) {
             if (String(scanIds[idx][0]) === regId) {
               cache.put("scan_" + regId, "1", 21600); // Backfill cache
               return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Pass Already Scanned!" })).setMimeType(ContentService.MimeType.JSON);
             }
           }
        }

        var scannerId = r.scannerId || "unknown";
        var finalTs = "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
        scansSh.appendRow([regId, String(r.name || ""), String(r.regno || ""), String(r.eventName || ""), String(r.teamName || "Solo"), finalTs, String(scannerId)]);
        
        // Mark as scanned in Cache for 6 hours
        cache.put("scan_" + regId, "1", 21600);
        
        SpreadsheetApp.flush(); 
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
      } finally {
        scanLock.releaseLock();
      }
    }

    // Team-based scan: marks individual members with composite IDs
    if (d.action === "handleTeamScan") {
      var scanLock2 = LockService.getScriptLock();
      if (!scanLock2.tryLock(8000)) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "System busy. Please scan again." })).setMimeType(ContentService.MimeType.JSON);
      try {
        var r = d.data;
        var baseRegId = r.regId;
        var members = r.members;
        var scannerId = r.scannerId || "unknown";
        var cache = CacheService.getScriptCache();

        // Check if the entire team pass was already scanned
        if (cache.get("scan_" + baseRegId)) {
           var allRes = [];
           for (var i = 0; i < members.length; i++) allRes.push({ index: members[i].index, status: "already_entered" });
           return ContentService.createTextOutput(JSON.stringify({ success: true, results: allRes })).setMimeType(ContentService.MimeType.JSON);
        }

        var scansSh = ss.getSheetByName("Scans") || ss.insertSheet("Scans");
        if (scansSh.getLastRow() === 0) enforceHeaders(scansSh);
        
        var results = [];
        var ts = "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
        
        for (var i = 0; i < members.length; i++) {
          var m = members[i];
          var scanId = baseRegId + "_M" + m.index;
          
          if (cache.get("scan_" + scanId)) {
            results.push({ index: m.index, status: "already_entered" });
          } else {
            scansSh.appendRow([scanId, String(m.name || ""), String(m.regno || ""), String(r.eventName || ""), String(r.teamName || "Solo"), ts, String(scannerId)]);
            cache.put("scan_" + scanId, "1", 21600);
            results.push({ index: m.index, status: "marked" });
          }
        }
        
        SpreadsheetApp.flush(); 
        return ContentService.createTextOutput(JSON.stringify({ success: true, results: results })).setMimeType(ContentService.MimeType.JSON);
      } finally {
        scanLock2.releaseLock();
      }
    }

    // Default Lock behavior for registrations (Sync, Add, Delete)
    var lock = LockService.getScriptLock();
    var successLock = lock.tryLock(28000);
    if (!successLock) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Server busy, please try again." })).setMimeType(ContentService.MimeType.JSON);
    }
    try {
      var sh = ss.getSheetByName("Registrations") || ss.insertSheet("Registrations");
      enforceHeaders(sh); // Ensure alignment is perfect before saving!
      var headers = OFFICIAL_HEADERS;

      if (d.action === "syncAll") {
        d.data.forEach(function (r) {
          // Matured Logic: Handle Solo events clearly in the sheet
          var teamNameValue = r.teamName && r.teamName.trim() !== "" ? r.teamName : "Solo";
          var teamMembersValue = r.teamMembers && r.teamMembers.length > 0 ? JSON.stringify(r.teamMembers) : "Solo";

          var finalTs = r.ts && r.ts.indexOf("T") === -1 ? "'" + r.ts : "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
          var rowToAppend = [r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventName, teamNameValue, teamMembersValue, finalTs, r.gender || ""];
          sh.appendRow(rowToAppend);
        });
        SpreadsheetApp.flush(); // Ensure instantly saved
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);

      } else if (d.action === "addReg") {
        var cache = CacheService.getScriptCache();
        var tsStr = cache.get("reg_timestamps") || "[]";
        var tsArr = [];
        try { tsArr = JSON.parse(tsStr); } catch(e){}
        var now = new Date().getTime();
        var filtered = [];
        for (var i = 0; i < tsArr.length; i++) {
           if (now - tsArr[i] < 60000) filtered.push(tsArr[i]);
        }
        if (filtered.length >= 20) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "RATE_LIMIT" })).setMimeType(ContentService.MimeType.JSON);
        }
        filtered.push(now);
        cache.put("reg_timestamps", JSON.stringify(filtered), 65);

        var r = d.data;

        // 1. Honeypot Anti-Bot Trap
        if (r.website && r.website.trim() !== "") {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Bot detected. Request denied." })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // 2. Strict Empty Field Verification
        if (!r.name || !r.name.trim() || !r.regno || !r.phone || !r.email || !r.email.trim()) {
           return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Missing required personal details. All fields are mandatory." })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // 3. Email Domain Enforcer
        var emailLC = (r.email || "").toLowerCase().trim();
        if (!emailLC.endsWith("@psnacet.edu.in")) {
           return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized email domain. Only @psnacet.edu.in allowed." })).setMimeType(ContentService.MimeType.JSON);
        }

        // 4. Phone Length Enforcer (strictly 10 digits)
        var purePhone = (r.phone || "").replace(/\D/g, "");
        if (purePhone.length !== 10) {
           return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Phone number must be exactly 10 digits." })).setMimeType(ContentService.MimeType.JSON);
        }

        // 5. Name / Regno format Enforcer
        var pureName = (r.name || "").replace(/[^A-Za-z\s]/g, "").trim();
        var pureRegNo = (r.regno || "").replace(/[^0-9]/g, "");
        if (pureName.length < 2 || pureRegNo.length < 7) {
           return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid format for Name or Register Number." })).setMimeType(ContentService.MimeType.JSON);
        }
        // Force replace with cleaned values
        r.name = pureName;
        r.regno = pureRegNo;
        
        var eventNameLC = String(r.eventName || "").toLowerCase().trim();

        var incomingRegNos = [String(r.regno || "").toLowerCase().trim()];
        var tMembers = r.teamMembers || [];
        // Max Team size hard check
        if (tMembers.length > 15) {
           return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Exceeded maximum team size limits." })).setMimeType(ContentService.MimeType.JSON);
        }
        for (var k = 0; k < tMembers.length; k++) {
          var tmReg = String(tMembers[k].regno || "").replace(/[^0-9]/g, "").toLowerCase().trim();
          var tmName = String(tMembers[k].name || "").replace(/[^A-Za-z\s]/g, "").trim();
          if (!tmReg || !tmName) {
             return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Incomplete team member details." })).setMimeType(ContentService.MimeType.JSON);
          }
          tMembers[k].regno = tmReg;
          tMembers[k].name = tmName;
          if (tmReg) incomingRegNos.push(tmReg);
        }

        var data = sh.getDataRange().getValues();
        var isDuplicate = false;
        var duplicateMsg = "You are already registered for this event.";

        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          if (String(row[headers.indexOf("RegID")] || "") === r.regId) {
            isDuplicate = true; break;
          }

          var rowEventName = String(row[headers.indexOf("Event")] || "").toLowerCase().trim();

          if (rowEventName === eventNameLC) {
            var rowEmail = String(row[headers.indexOf("Email")] || "").toLowerCase().trim();
            if (rowEmail && rowEmail === emailLC) {
              isDuplicate = true; break;
            }

            var rowLeaderRegNo = String(row[headers.indexOf("RegNo")] || "").toLowerCase().trim();
            if (incomingRegNos.indexOf(rowLeaderRegNo) !== -1) {
              isDuplicate = true;
              duplicateMsg = "Duplicate error: Register number " + rowLeaderRegNo + " is already registered for this event.";
              break;
            }

            var teamMembersRaw = String(row[headers.indexOf("TeamMembers")] || "[]");
            var existTeam = [];
            try { existTeam = JSON.parse(teamMembersRaw); } catch (ex) { }

            for (var j = 0; j < existTeam.length; j++) {
              var existTmReg = String(existTeam[j].regno || "").toLowerCase().trim();
              if (existTmReg && incomingRegNos.indexOf(existTmReg) !== -1) {
                isDuplicate = true;
                duplicateMsg = "Duplicate error: Register number " + existTmReg + " is already in another team for this event.";
                break;
              }
            }
            if (isDuplicate) break;
          }
        }

        if (isDuplicate) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: duplicateMsg })).setMimeType(ContentService.MimeType.JSON);
        }

        // Forcefully overwrite the frontend's timestamp with the server's exact Indian Standard Time
        // Prepending an apostrophe (') forces Google Sheets to treat it as plain text instead of trying to autoconvert to an ISO Date
        // Matured Logic: Explicitly label Solo registrations in the sheet for clarity
        var teamNameValue = r.teamName && r.teamName.trim() !== "" ? r.teamName : "Solo";
        var teamMembersValue = r.teamMembers && r.teamMembers.length > 0 ? JSON.stringify(r.teamMembers) : "Solo";

        var finalTs = "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");

        var rowToAppend = [r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventName, teamNameValue, teamMembersValue, finalTs, r.gender || ""];
        sh.appendRow(rowToAppend);
        SpreadsheetApp.flush(); // Forces the sheet to save and sync instantly, preventing the "blank screen" effect

        return ContentService.createTextOutput(JSON.stringify({ success: true, regId: r.regId })).setMimeType(ContentService.MimeType.JSON);

      } else if (d.action === "deleteReg") {
        var regIdToDelete = d.data.regId;
        var data = sh.getDataRange().getValues();
        var deleted = false;
        for (var i = data.length - 1; i >= 1; i--) {
          if (String(data[i][0]) === String(regIdToDelete)) {
            sh.deleteRow(i + 1);
            deleted = true;
            break;
          }
        }
        if (deleted) SpreadsheetApp.flush();
        return ContentService.createTextOutput(JSON.stringify({ success: deleted, error: deleted ? null : "Registration not found" })).setMimeType(ContentService.MimeType.JSON);

      } else if (d.action === "deleteAll") {
        var lastRow = sh.getLastRow();
        if (lastRow > 1) {
          // Delete all rows from row 2 downward
          sh.deleteRows(2, lastRow - 1);
          SpreadsheetApp.flush(); // Ensure instantly saved
        }
        var scanSh = ss.getSheetByName("Scans");
        if (scanSh && scanSh.getLastRow() > 1) {
          scanSh.deleteRows(2, scanSh.getLastRow() - 1);
          SpreadsheetApp.flush();
        }
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
      }

      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);

    } finally {
      lock.releaseLock(); // Release the default registration lock
    }

  } catch (ex) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Server Error: " + ex.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
