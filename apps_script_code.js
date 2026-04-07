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

// The exact column structure you need, with Gender at the end and SystemData hidden.
var OFFICIAL_HEADERS = ["RegID", "Name", "RegNo", "Year", "Section", "Phone", "Email", "Event", "TeamName", "TeamMembers", "Timestamp", "Gender", "SystemData"];
var SCAN_HEADERS = ["RegID", "Name", "RegNo", "Year", "Section", "Event", "TeamName", "Member1", "Member1RegNo", "Member2", "Member2RegNo", "Member3", "Member3RegNo", "Member4", "Member4RegNo", "Timestamp", "ScannerID"];

function enforceHeaders(sh) {
  var shName = String(sh.getName()).trim();
  var headers = shName === "Scans" ? SCAN_HEADERS : OFFICIAL_HEADERS;
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
  // Auto-resize columns for readability
  try { sh.autoResizeColumns(1, headers.length); } catch(e){}
}

function findRegistrationRecord(ss, regId) {
  var sheets = ["Registrations", "Dance_Registrations"];
  for (var s = 0; s < sheets.length; s++) {
    var sh = ss.getSheetByName(sheets[s]);
    if (!sh) continue;
    var data = sh.getDataRange().getValues();
    if (data.length < 2) continue;
    var headers = data[0];
    var idCol = headers.indexOf("RegID");
    if (idCol === -1) continue;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === regId) {
        var record = {};
        for (var j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j];
        }
        return record;
      }
    }
  }
  return null;
}

// ── Auth Helper for GET actions ──
function checkAuth(e) {
  var uid = (e.parameter.uid || "").trim();
  var pwd = (e.parameter.pwd || "").trim();
  return (uid === "sriram" || uid === "utsavqr") && pwd === "93611";
}

// ── GET requests (Admin Panel + Fetch Pass) ──
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var targetSheet = (e.parameter.targetSheet || "Registrations").trim();
  var sh = ss.getSheetByName(targetSheet);
  if (!sh) return ContentService.createTextOutput(JSON.stringify({ found: false, registrations: [], error: "Sheet not found: " + targetSheet })).setMimeType(ContentService.MimeType.JSON);

  if (sh.getLastRow() === 0) enforceHeaders(sh); // Auto-fix alignment if sheet is fresh
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

  // ── Get Access Feature Flags & Committee Data (public) ──
  if (action === "getAccess") {
    var accessMap = { show_team_btn: true, registrations_open: true };
    var accessSh = ss.getSheetByName("Access");
    
    // Auto-create Access tab if missing
    if (!accessSh) {
      accessSh = ss.insertSheet("Access");
      accessSh.getRange(1, 1, 1, 2).setValues([["Flag", "Value"]]);
      accessSh.getRange(2, 1, 2, 2).setValues([
        ["show_team_btn", "TRUE"],
        ["registrations_open", "TRUE"]
      ]);
      accessSh.getRange(1, 1, 1, 2).setFontWeight("bold");
      accessSh.setColumnWidth(1, 200);
      accessSh.setColumnWidth(2, 120);
    }
    
    var accessData = accessSh.getDataRange().getValues();
    for (var i = 1; i < accessData.length; i++) {
      var key = String(accessData[i][0] || "").trim();
      var val = String(accessData[i][1] || "").trim();
      if (!key) continue;
      if (val.toUpperCase() === "TRUE") accessMap[key] = true;
      else if (val.toUpperCase() === "FALSE") accessMap[key] = false;
      else accessMap[key] = val;
    }

    // Read Committee (Team Members) sheet — auto-create if missing
    var committeeData = [];
    var commSh = ss.getSheetByName("Committee");
    if (!commSh) {
      commSh = ss.insertSheet("Committee");
      var commHeaders = ["Name", "Role", "Department", "Photo", "Phone", "IsHead", "HasGlow"];
      commSh.getRange(1, 1, 1, commHeaders.length).setValues([commHeaders]);
      commSh.getRange(1, 1, 1, commHeaders.length).setFontWeight("bold");
      commSh.setColumnWidth(1, 160);
      commSh.setColumnWidth(2, 180);
      commSh.setColumnWidth(3, 160);
      commSh.setColumnWidth(4, 300);
      commSh.setColumnWidth(5, 140);
      commSh.setColumnWidth(6, 80);
      commSh.setColumnWidth(7, 80);
    }

    var commRows = commSh.getDataRange().getValues();
    if (commRows.length > 1) {
      var commHeaders = commRows[0].map(function(h) { return String(h).trim().toLowerCase(); });
      for (var c = 1; c < commRows.length; c++) {
        var cRow = commRows[c];
        var commObj = {};
        for (var col = 0; col < commHeaders.length; col++) {
          commObj[commHeaders[col]] = cRow[col];
        }
        if (commObj.name || commObj.role) {
          committeeData.push(commObj);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      access: accessMap,
      committee: committeeData
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ── Fetch Events list dynamically (public) ──
  if (action === "getEvents") {
    var evSh = ss.getSheetByName("Events");
    var eventsData = [];
    
    if (evSh) {
      var evRows = evSh.getDataRange().getValues();
      if (evRows.length > 1) {
        var evHeaders = evRows[0].map(function(h) { return String(h).trim(); }); // keep case for UI mapped names
        for (var eRow = 1; eRow < evRows.length; eRow++) {
          var rowObj = {};
          var hasName = false;
          for (var col = 0; col < evHeaders.length; col++) {
            var cellVal = String(evRows[eRow][col] || "").trim();
            rowObj[evHeaders[col]] = cellVal;
            var headerKey = evHeaders[col].replace(/\s/g, '').toLowerCase();
            if (headerKey === "eventname" && cellVal) hasName = true;
          }
          if (hasName) {
            eventsData.push(rowObj);
          }
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      events: eventsData
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getRegs") {
    if (!checkAuth(e)) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
    var data = sh.getDataRange().getValues();
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ registrations: [] })).setMimeType(ContentService.MimeType.JSON);

    var headers = OFFICIAL_HEADERS;
    var results = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var systemDataIndex = headers.indexOf("SystemData");
      var teamMembersRaw = (systemDataIndex >= 0 && row[systemDataIndex]) ? row[systemDataIndex] : (row[headers.indexOf("TeamMembers")] || "[]");
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
        ts: String(row[headers.indexOf("Timestamp")] || ""),
        timeSlot: ""
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ registrations: results })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "lookup") {
    var email = (e.parameter.email || "").toLowerCase().trim();
    var lookupId = (e.parameter.id || "").trim();
    var fetchRegno = (e.parameter.fetchRegno || "").replace(/[^0-9]/g, "").trim(); // RegNo-based pass recovery
    var checkRegNosStr = e.parameter.regnos || "";
    var checkEventName = (e.parameter.eventName || "").trim();
    // Allow regno-only duplicate checks (no email needed with new auto-fetch model)
    var hasRegnoCheck = checkRegNosStr && checkEventName;
    var hasPassFetch = fetchRegno.length >= 7; // Pass recovery by RegNo
    if (!email && !lookupId && !hasRegnoCheck && !hasPassFetch) return ContentService.createTextOutput(JSON.stringify({ found: false, registrations: [] })).setMimeType(ContentService.MimeType.JSON);

    var checkEventId = e.parameter.eventId || ""; // Using eventName fallback below
    if (!checkRegNosStr) checkRegNosStr = e.parameter.regnos || "";
    if (!checkEventName) checkEventName = "";
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
      var rowRegId = String(row[headers.indexOf("RegID")] || ("GF-" + (i + 1)));
      var rowEmail = String(row[headers.indexOf("Email")] || "").toLowerCase().trim();
      var rowEventName = String(row[headers.indexOf("Event")] || "").trim();
      var systemDataIndex = headers.indexOf("SystemData");
      // SystemData column holds JSON team array; TeamMembers is just a visual string
      // Only parse from SystemData — falling back to TeamMembers visual string always fails JSON.parse
      var teamMembersRaw = (systemDataIndex >= 0 && row[systemDataIndex] && String(row[systemDataIndex]).trim() !== "Solo" && String(row[systemDataIndex]).trim() !== "") ? String(row[systemDataIndex]) : "[]";
      var teamMembers = [];
      try { teamMembers = JSON.parse(teamMembersRaw); if (!Array.isArray(teamMembers)) teamMembers = []; } catch (ex) { teamMembers = []; }

      if ((email && rowEmail === email) || (lookupId && rowRegId === lookupId)) {
        results.push({
          regId: String(row[headers.indexOf("RegID")] || ("GF-" + (i + 1))),
          name: String(row[headers.indexOf("Name")] || ""),
          regno: String(row[headers.indexOf("RegNo")] || ""),
          gender: String(row[headers.indexOf("Gender")] || ""),
          year: String(row[headers.indexOf("Year")] || ""),
          section: String(row[headers.indexOf("Section")] || ""),
          phone: String(row[headers.indexOf("Phone")] || ""),
          email: String(row[headers.indexOf("Email")] || ""),
          eventId: "",
          eventName: rowEventName,
          teamName: String(row[headers.indexOf("TeamName")] || ""),
          teamMembers: teamMembers,
          ts: String(row[headers.indexOf("Timestamp")] || ""),
          timeSlot: ""
        });
      }

      // ── Pass Recovery by RegNo: match leader OR team member ──
      if (hasPassFetch) {
        var rowLeaderRegNoForFetch = String(row[headers.indexOf("RegNo")] || "").replace(/[^0-9]/g, "").trim();
        var isLeaderMatch = (rowLeaderRegNoForFetch === fetchRegno);
        var isMemberMatch = false;
        for (var m = 0; m < teamMembers.length; m++) {
          var tmReg = String(teamMembers[m].regno || "").replace(/[^0-9]/g, "").trim();
          if (tmReg === fetchRegno) { isMemberMatch = true; break; }
        }
        if ((isLeaderMatch || isMemberMatch) && !results.some(function (r) { return r.regId === rowRegId; })) {
          results.push({
            regId: rowRegId,
            name: String(row[headers.indexOf("Name")] || ""),
            regno: String(row[headers.indexOf("RegNo")] || ""),
            gender: String(row[headers.indexOf("Gender")] || ""),
            year: String(row[headers.indexOf("Year")] || ""),
            section: String(row[headers.indexOf("Section")] || ""),
            eventId: "",
            eventName: rowEventName,
            teamName: String(row[headers.indexOf("TeamName")] || ""),
            teamMembers: teamMembers,
            ts: String(row[headers.indexOf("Timestamp")] || ""),
            timeSlot: ""
          });
        }
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

  // ── Student Auto-Fetch by Register Number ──
  if (action === "studentLookup") {
    var regno = (e.parameter.regno || "").replace(/[^0-9]/g, "").trim();
    if (!regno || regno.length < 5) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid register number" })).setMimeType(ContentService.MimeType.JSON);
    }
    var studentsSh = ss.getSheetByName("AllStudents") || ss.getSheetByName("Students");
    if (!studentsSh) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Students sheet not found" })).setMimeType(ContentService.MimeType.JSON);
    }
    var sData = studentsSh.getDataRange().getValues();
    if (sData.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No student data available" })).setMimeType(ContentService.MimeType.JSON);
    }
    // Detect columns from header row (case-insensitive)
    var sHeaders = sData[0].map(function (h) { return String(h).toLowerCase().trim(); });
    var colRegno = sHeaders.indexOf("regno");
    var colName = sHeaders.indexOf("name");
    var colYear = sHeaders.indexOf("year");
    var colSection = sHeaders.indexOf("section");
    // Fallback aliases
    if (colRegno === -1) colRegno = sHeaders.findIndex(function (h) { return h.includes("reg"); });
    if (colName === -1) colName = sHeaders.findIndex(function (h) { return h.includes("name"); });
    if (colYear === -1) colYear = sHeaders.findIndex(function (h) { return h.includes("year"); });
    if (colSection === -1) colSection = sHeaders.findIndex(function (h) { return h.includes("sec"); });
    if (colRegno === -1 || colName === -1) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Students sheet missing RegNo or Name column" })).setMimeType(ContentService.MimeType.JSON);
    }
    for (var i = 1; i < sData.length; i++) {
      var rowRegno = String(sData[i][colRegno] || "").replace(/[^0-9]/g, "").trim();
      if (rowRegno === regno) {
        var year = colYear >= 0 ? String(sData[i][colYear] || "").trim() : "";
        var section = colSection >= 0 ? String(sData[i][colSection] || "").trim() : "";
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          name: String(sData[i][colName] || "").trim(),
          year: year,
          section: section
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Student not found. Please enter details manually." })).setMimeType(ContentService.MimeType.JSON);
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
    if (!checkAuth(e)) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
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

    // ── Toggle Members Section (requires admin auth) ──
    if (d.action === "setMembersVisibility") {
      if (d.uid !== "sriram" || d.pwd !== "93611") {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
      }
      var accessSh = ss.getSheetByName("Access");
      if (!accessSh) {
         accessSh = ss.insertSheet("Access");
         accessSh.getRange(1, 1).setValue("members");
      }
      var data = accessSh.getDataRange().getValues();
      var foundRow = -1;
      for (var i = 0; i < data.length; i++) {
        if (String(data[i][0]).toLowerCase().trim() === "members") {
          foundRow = i + 1;
          break;
        }
      }
      if (foundRow === -1) {
        foundRow = accessSh.getLastRow() + 1;
        accessSh.getRange(foundRow, 1).setValue("members");
      }
      var newVal = d.status === "ON" ? "ON" : "OFF";
      accessSh.getRange(foundRow, 2).setValue(newVal);
      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ success: true, members: newVal })).setMimeType(ContentService.MimeType.JSON);
    }

    // ── Add Committee Member (requires admin auth) ──
    if (d.action === "addCommittee") {
      if (d.uid !== "sriram" || d.pwd !== "93611") {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
      }
      var commSh = ss.getSheetByName("Committee") || ss.insertSheet("Committee");
      if (commSh.getLastRow() === 0) {
        var commHeaders = ["Name", "Role", "Department", "Photo", "Phone", "IsHead", "HasGlow", "Visible"];
        commSh.getRange(1, 1, 1, commHeaders.length).setValues([commHeaders]);
        commSh.getRange(1, 1, 1, commHeaders.length).setFontWeight("bold");
      }
      var r = d.data;
      var newRow = [
        String(r.name || ""),
        String(r.position || ""),
        String(r.event || ""),
        String(r.image || ""),
        "", // Phone (not requested but standard)
        r.highlight ? "TRUE" : "FALSE", // IsHead
        r.highlight ? "TRUE" : "FALSE", // HasGlow
        r.visible !== undefined ? (r.visible ? "ON" : "OFF") : "ON"
      ];
      commSh.appendRow(newRow);
      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // ── Optimized Get Registration by ID (for RegID-only QR model) ──
    if (d.action === "getRegById") {
      var regId = (d.regId || "").trim();
      if (!regId) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Missing RegID" })).setMimeType(ContentService.MimeType.JSON);
      
      var record = findRegistrationRecord(ss, regId);
      if (!record) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Registration Not Found" })).setMimeType(ContentService.MimeType.JSON);

      // Check "Already Scanned" status and Individual Member statuses
      var isScanned = false;
      var enteredIndices = [];
    var scansSh = ss.getSheetByName("Scans");
    if (scansSh && scansSh.getLastColumn() < SCAN_HEADERS.length) enforceHeaders(scansSh);
      
      var teamMembers = [];
      try {
        // SystemData has the real JSON array. TeamMembers may be visual text or JSON.
        var rawSD = String(record["SystemData"] || "").trim();
        var rawTM = String(record["TeamMembers"] || "").trim();
        var rawToUse = "";
        
        // Priority 1: SystemData with JSON array
        if (rawSD && rawSD.charAt(0) === "[") {
          rawToUse = rawSD;
        }
        // Priority 2: TeamMembers with JSON array (fresh registrations)
        else if (rawTM && rawTM.charAt(0) === "[") {
          rawToUse = rawTM;
        }
        
        if (rawToUse) {
          var parsed = JSON.parse(rawToUse);
          if (Array.isArray(parsed)) teamMembers = parsed;
        }
        
        // Priority 3: Parse visual string "1. Name (RegNo) | 2. Name (RegNo)" as fallback
        if (teamMembers.length === 0 && rawTM && rawTM !== "Solo" && rawTM.indexOf(".") !== -1) {
          var parts = rawTM.split("|");
          for (var p = 0; p < parts.length; p++) {
            var part = parts[p].trim();
            // Match "1. Name (RegNo)" pattern
            var nameMatch = part.match(/^\d+\.\s*(.+?)\s*\(([^)]+)\)/);
            if (nameMatch) {
              teamMembers.push({ name: nameMatch[1].trim(), regno: nameMatch[2].trim() });
            }
          }
        }
      } catch (e) { teamMembers = []; }
      
      var totalPossible = 1 + teamMembers.length;

      if (scansSh && scansSh.getLastRow() > 1) {
        var scanIds = scansSh.getRange(2, 1, Math.min(scansSh.getLastRow() - 1, 5000), 1).getValues();
        for (var i = 0; i < scanIds.length; i++) {
          var sid = String(scanIds[i][0]);
          if (sid === regId) { 
            isScanned = true; 
            for (var k = 0; k < totalPossible; k++) enteredIndices.push(k);
            break; 
          }
          if (sid.indexOf(regId + "_M") === 0) {
            var mIdx = parseInt(sid.substring((regId + "_M").length));
            if (!isNaN(mIdx) && enteredIndices.indexOf(mIdx) === -1) enteredIndices.push(mIdx);
          }
        }
      }
      
      if (enteredIndices.length >= totalPossible) isScanned = true;

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        isAlreadyScanned: isScanned,
        enteredIndices: enteredIndices,
        participant: {
          regId: String(record.RegID || ""),
          name: String(record.Name || ""),
          regno: String(record.RegNo || ""),
          year: String(record.Year || ""),
          section: String(record.Section || ""),
          eventName: String(record.Event || ""),
          teamName: String(record.TeamName || "Solo"),
          teamMembers: teamMembers
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Optimized Scan Handle (Fast execution, localized lock, duplicate prevention)
    if (d.action === "handleScan") {
      if ((d.uid !== "sriram" && d.uid !== "utsavqr") || d.pwd !== "93611") {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
      }
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
        enforceHeaders(scansSh); // ALWAYS enforce correct 17 headers

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

        // --- ENHANCED OD LOGGING ---
        var record = findRegistrationRecord(ss, regId);
        var resName = r.name || (record ? record.Name : "");
        var resRegNo = r.regno || (record ? record.RegNo : "");
        var resEvent = r.eventName || (record ? record.Event : "");
        var resTeam = r.teamName || (record ? record.TeamName : "Solo");
        var resYear = record ? record.Year : "";
        var resSection = record ? record.Section : "";

        var m1 = "", m1r = "", m2 = "", m2r = "", m3 = "", m3r = "", m4 = "", m4r = "";
        
        if (record) {
          var members = [];
          if (String(resTeam).toLowerCase() === "solo" || !record.TeamMembers || record.TeamMembers === "Solo") {
            members = [{ name: String(record.Name), regno: String(record.RegNo) }];
          } else {
            try {
              members = typeof record.TeamMembers === "string" ? JSON.parse(record.TeamMembers) : record.TeamMembers;
            } catch (e) {
              members = [{ name: String(record.Name), regno: String(record.RegNo) }];
            }
          }
          if (!Array.isArray(members)) members = [members];

          if (members[0]) { m1 = members[0].name; m1r = members[0].regno; }
          if (members[1]) { m2 = members[1].name; m2r = members[1].regno; }
          if (members[2]) { m3 = members[2].name; m3r = members[2].regno; }
          if (members[3]) { m4 = members[3].name; m4r = members[3].regno; }
        } else {
          // Fallback to basic data if record not found
          m1 = resName; m1r = resRegNo;
        }

        var scanRow = [
          regId, String(resName), String(resRegNo), String(resYear), String(resSection), String(resEvent), String(resTeam),
          String(m1 || ""), String(m1r || ""), String(m2 || ""), String(m2r || ""), String(m3 || ""), String(m3r || ""), String(m4 || ""), String(m4r || ""),
          finalTs, String(scannerId)
        ];
        scansSh.appendRow(scanRow);

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
      if ((d.uid !== "sriram" && d.uid !== "utsavqr") || d.pwd !== "93611") {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
      }
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
        enforceHeaders(scansSh); // ALWAYS enforce correct 17 headers

        var results = [];
        var ts = "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");

        for (var i = 0; i < members.length; i++) {
          var m = members[i];
          var mIndex = parseInt(m.index);
          var scanId = baseRegId + "_M" + mIndex;

          if (cache.get("scan_" + scanId)) {
            results.push({ index: mIndex, status: "already_entered" });
          } else {
            // Construct 17-column row with member in correct slot
            var rowData = [
              scanId, String(m.name || ""), String(m.regno || ""), String(m.year || ""), String(m.section || ""), String(r.eventName || ""), String(r.teamName || "Solo"),
              "", "", "", "", "", "", "", "", // Member 1-4 slots (8-15)
              ts, String(scannerId)
            ];
            
            // Map index to correct columns: 0->8,9; 1->10,11; 2->12,13; 3->14,15
            var colStart = 7 + (mIndex * 2);
            if (colStart >= 7 && colStart <= 14) {
              // Populate slot with Member Data as requested
              rowData[colStart] = String(m.name || "");
              rowData[colStart + 1] = String(m.regno || "");
            }

            scansSh.appendRow(rowData);
            cache.put("scan_" + scanId, "1", 21600);
            results.push({ index: mIndex, status: "marked" });
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
      var r = d.data || {};
      var targetSheet = (r.targetSheet || "Registrations").trim();

      // Separate Dance registrations into their own tab
      if (r.eventName && (r.eventName.toLowerCase().indexOf("dance") !== -1 || r.eventName.toLowerCase().indexOf("cultural") !== -1)) {
        targetSheet = "Dance_Registrations";
      }

      var sh = ss.getSheetByName(targetSheet) || ss.insertSheet(targetSheet);
      if (sh.getLastRow() === 0) enforceHeaders(sh);
      var headers = OFFICIAL_HEADERS;

      if (d.action === "syncAll") {
        if (d.uid !== "sriram" || d.pwd !== "93611") {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
        }
        d.data.forEach(function (r) {
          // Matured Logic: Handle Solo events clearly in the sheet
          var teamNameValue = r.teamName && r.teamName.trim() !== "" ? r.teamName : "Solo";
          var teamMembersValue = r.teamMembers && r.teamMembers.length > 0 ? JSON.stringify(r.teamMembers) : "Solo";

          var finalTs = r.ts && r.ts.indexOf("T") === -1 ? "'" + r.ts : "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
          var rowToAppend = [r.regId, r.name, r.regno, r.year, r.section, "", "", r.eventName, teamNameValue, teamMembersValue, finalTs, r.gender || "Not Set", teamMembersValue];
          sh.appendRow(rowToAppend);
        });
        SpreadsheetApp.flush(); // Ensure instantly saved
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);

      } else if (d.action === "addReg") {
        var r = d.data;
        var cache = CacheService.getScriptCache();
        // Rate limit by regno (since email is no longer collected)
        var key = "limit_" + (r.regno || "unknown").replace(/[^a-z0-9]/gi, "");
        var tsStr = cache.get(key) || "[]";
        var tsArr = [];
        try { tsArr = JSON.parse(tsStr); } catch (e) { }
        var now = new Date().getTime();
        var filtered = [];
        for (var i = 0; i < tsArr.length; i++) {
          if (now - tsArr[i] < 60000) filtered.push(tsArr[i]);
        }
        if (filtered.length >= 20) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "RATE_LIMIT" })).setMimeType(ContentService.MimeType.JSON);
        }
        filtered.push(now);
        cache.put(key, JSON.stringify(filtered), 65);

        var regId = String(r.regId || "");

        // --- 0. Idempotency Check (Strong Protection) ---
        var data = sh.getDataRange().getValues();
        var headers = OFFICIAL_HEADERS;
        var regIdCol = headers.indexOf("RegID");
        for (var i = 1; i < data.length; i++) {
          if (regIdCol !== -1 && String(data[i][regIdCol]) === regId) {
            return ContentService.createTextOutput(JSON.stringify({ success: true, regId: regId, alreadyExisted: true })).setMimeType(ContentService.MimeType.JSON);
          }
        }

        // 1. Honeypot Anti-Bot Trap
        if (r.website && r.website.trim() !== "") {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Bot detected. Request denied." })).setMimeType(ContentService.MimeType.JSON);
        }

        // 2. Strict Empty Field Verification (phone/email no longer required)
        if (!r.name || !r.name.trim() || !r.regno || !r.regno.trim()) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Missing required details: Name and Register Number are mandatory." })).setMimeType(ContentService.MimeType.JSON);
        }

        // 3. Name / Regno format Enforcer
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

        var isDuplicate = false;
        var duplicateMsg = "You are already registered for this event.";
        var allowMultiple = !!r.allowMultiple;

        if (!allowMultiple) {
          for (var i = 1; i < data.length; i++) {
            var row = data[i];
            if (String(row[headers.indexOf("RegID")] || "") === r.regId) {
              isDuplicate = true; break;
            }

            var rowEventName = String(row[headers.indexOf("Event")] || "").toLowerCase().trim();

            if (rowEventName === eventNameLC) {
              // Duplicate check by RegNo (email no longer in use)
              var rowLeaderRegNo = String(row[headers.indexOf("RegNo")] || "").toLowerCase().trim();
              if (incomingRegNos.indexOf(rowLeaderRegNo) !== -1) {
                isDuplicate = true;
                duplicateMsg = "Duplicate error: Register number " + rowLeaderRegNo + " is already registered for this event.";
                break;
              }

              var systemDataIndex = headers.indexOf("SystemData");
              var teamMembersRaw = String((systemDataIndex >= 0 && row[systemDataIndex]) ? row[systemDataIndex] : (row[headers.indexOf("TeamMembers")] || "[]"));
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
        }

        if (isDuplicate) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: duplicateMsg })).setMimeType(ContentService.MimeType.JSON);
        }

        // Forcefully overwrite the frontend's timestamp with the server's exact Indian Standard Time
        // Prepending an apostrophe (') forces Google Sheets to treat it as plain text instead of trying to autoconvert to an ISO Date
        // Matured Logic: Explicitly label Solo registrations in the sheet for clarity
        var teamNameValue = r.teamName && r.teamName.trim() !== "" ? r.teamName : "Solo";
        var teamMembersJSON = r.teamMembers && r.teamMembers.length > 0 ? JSON.stringify(r.teamMembers) : "Solo";
        var teamMembersVisual = "Solo";
        if (r.teamMembers && r.teamMembers.length > 0) {
          var vArr = [];
          for (var k = 0; k < r.teamMembers.length; k++) {
            vArr.push((k + 1) + ". " + (r.teamMembers[k].name || "Unknown") + " (" + (r.teamMembers[k].regno || "No Reg") + ")");
          }
          teamMembersVisual = vArr.join(" | "); // Formatted for sheet view
        }

        var finalTs = "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
        var genderStr = r.gender || "Not Set";
        // Columns: RegID, Name, RegNo, Year, Section, Phone, Email, Event, TeamName, TeamMembers (Visual), Timestamp, Gender, SystemData (JSON)
        var rowToAppend = [r.regId, r.name, r.regno, r.year, r.section, "", "", r.eventName, teamNameValue, teamMembersVisual, finalTs, genderStr, teamMembersJSON];
        sh.appendRow(rowToAppend);
        SpreadsheetApp.flush(); // Forces the sheet to save and sync instantly, preventing the "blank screen" effect

        return ContentService.createTextOutput(JSON.stringify({ success: true, regId: r.regId })).setMimeType(ContentService.MimeType.JSON);

      } else if (d.action === "deleteReg") {
        if (d.uid !== "sriram" || d.pwd !== "93611") {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
        }
        var regIdToDelete = d.data.regId;
        var data = sh.getDataRange().getValues();
        var regCol = headers.indexOf("RegID");
        for (var i = data.length - 1; i >= 1; i--) {
          if (String(data[i][regCol === -1 ? 0 : regCol]) === String(regIdToDelete)) {
            sh.deleteRow(i + 1);
            deleted = true;
            break;
          }
        }
        if (deleted) SpreadsheetApp.flush();
        return ContentService.createTextOutput(JSON.stringify({ success: deleted, error: deleted ? null : "Registration not found" })).setMimeType(ContentService.MimeType.JSON);

      } else if (d.action === "deleteAll") {
        if (d.uid !== "sriram" || d.pwd !== "93611") {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
        }
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

// ══════════════════════════════════════════
// DATA CLEANER UTILITY FUNCTION
// Run this directly from the Google Apps Script editor
// ══════════════════════════════════════════
function cleanRegistrationsDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Registrations");
  if (!sh) { Logger.log("Registrations sheet not found!"); return; }

  var data = sh.getDataRange().getValues();
  if (data.length <= 1) { Logger.log("No data to clean!"); return; }

  var headers = data[0].map(function (h) { return String(h).trim(); });

  // Goal Structure
  var GOAL = ["RegID", "Name", "RegNo", "Year", "Section", "Phone", "Email", "Event", "TeamName", "TeamMembers", "Timestamp", "Gender", "SystemData"];

  // Create a clean array of records
  var cleanRecords = [];
  var seenMap = {}; // Tracks RegNo + Event for deduplication
  var removedInvalid = 0;
  var removedDupes = 0;

  for (var i = 1; i < data.length; i++) {
    var rawRow = data[i];

    // Map current arbitrary row to standard dictionary
    var mapped = {};
    for (var col = 0; col < headers.length; col++) {
      mapped[headers[col]] = rawRow[col];
    }

    var regno = String(mapped["RegNo"] || "").replace(/[^0-9]/g, "").trim();
    var name = String(mapped["Name"] || "").trim();
    var eventName = String(mapped["Event"] || "").trim();
    var genderStr = String(mapped["Gender"] || "");

    // Safety fallback for old sheets where JSON might be in TeamMembers
    var systemData = String(mapped["SystemData"] || "");
    var teamDataRaw = String(mapped["TeamMembers"] || "").trim();
    var stringToParse = systemData || teamDataRaw;

    // 1. Invalid checks
    if (!regno || regno.length < 5 || !name || name.toLowerCase() === "test" || regno === "555555") {
      removedInvalid++;
      continue;
    }

    // 2. Duplicate Check (Keep latest valid entry by reading from top to down, overriding older)
    var key = regno + "||" + eventName;

    // 3. Fix TeamMembers Formatting
    var validTeamJSON = "Solo";
    var validTeamVisual = "Solo";

    if (stringToParse && stringToParse !== "Solo") {
      try {
        var parsed = JSON.parse(stringToParse);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
          validTeamJSON = JSON.stringify(parsed);
          var vArr = [];
          for (var k = 0; k < parsed.length; k++) {
            vArr.push((k + 1) + ". " + (parsed[k].name || "Unknown") + " (" + (parsed[k].regno || "No Reg") + ")");
          }
          validTeamVisual = vArr.join(" | ");
        }
      } catch (e) {
        // Not valid JSON, keep as is for visual, JSON is blank
        validTeamVisual = teamDataRaw || "Solo";
        validTeamJSON = "Solo";
      }
    }

    // Standardize object
    seenMap[key] = [
      String(mapped["RegID"] || ""),
      name,
      regno,
      String(mapped["Year"] || ""),
      String(mapped["Section"] || ""),
      String(mapped["Phone"] || ""),
      String(mapped["Email"] || ""),
      eventName,
      String(mapped["TeamName"] || "Solo"),
      validTeamVisual,
      String(mapped["Timestamp"] || ""),
      genderStr,
      validTeamJSON
    ];
  }

  // Convert valid map to array
  var keys = Object.keys(seenMap);
  for (var j = 0; j < keys.length; j++) {
    cleanRecords.push(seenMap[keys[j]]);
  }

  removedDupes = (data.length - 1) - cleanRecords.length - removedInvalid;

  // Clear sheet and apply target format
  sh.clear();
  sh.getRange(1, 1, 1, GOAL.length).setValues([GOAL]);
  sh.getRange(1, 1, 1, GOAL.length).setFontWeight("bold");

  if (cleanRecords.length > 0) {
    sh.getRange(2, 1, cleanRecords.length, GOAL.length).setValues(cleanRecords);
  }

  Logger.log("=== CLEANUP REPORT ===");
  Logger.log("Original Rows: " + (data.length - 1));
  Logger.log("Removed Invalid: " + removedInvalid);
  Logger.log("Removed Duplicates: " + removedDupes);
  Logger.log("Final Row Count: " + cleanRecords.length);
  Logger.log("Transformation Complete: Formatted arrays with hidden JSON backup.");
}