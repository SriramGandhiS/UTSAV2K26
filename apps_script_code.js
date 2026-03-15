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

function enforceHeaders(sh) {
  // Overwrite Row 1 with official headers
  sh.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
  // Clear any extra garbled columns to the right (like M, N)
  var lc = sh.getLastColumn();
  if (lc > OFFICIAL_HEADERS.length) {
    sh.getRange(1, OFFICIAL_HEADERS.length + 1, sh.getMaxRows(), lc - OFFICIAL_HEADERS.length).clearContent();
  }
}

// ── GET requests (Admin Panel + Fetch Pass) ──
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Registrations");
  if (!sh) return ContentService.createTextOutput(JSON.stringify({ found: false, registrations: [] })).setMimeType(ContentService.MimeType.JSON);

  enforceHeaders(sh); // Auto-fix alignment immediately
  var action = (e.parameter.action || "").trim();

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
          "design decode": "B",
          "checkmate coders": "A",
          "uno reverse": "B",
          "brand to billion": "C",
          "zero code zone": "C",
          "technotrace": "D",
          "clash of minds": "A",
          "franchise fiesta": "B",
          "the algorithmic platter": "C"
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

  return ContentService.createTextOutput(JSON.stringify({ found: false, registrations: [] })).setMimeType(ContentService.MimeType.JSON);
}

// ── POST requests (Save registrations) ──
function doPost(e) {
  var lock = LockService.getScriptLock();
  var successLock = lock.tryLock(10000);

  if (!successLock) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Server busy, please try again." })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("Registrations") || ss.insertSheet("Registrations");

    enforceHeaders(sh); // Ensure alignment is perfect before saving!
    var headers = OFFICIAL_HEADERS;

    var d = JSON.parse(e.postData.contents);

    if (d.action === "syncAll") {
      d.data.forEach(function (r) {
        // Force server time on sync & prepend apostrophe for text formatting
        var finalTs = r.ts && r.ts.indexOf("T") === -1 ? "'" + r.ts : "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
        var rowToAppend = [r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventName, r.teamName || "", JSON.stringify(r.teamMembers || []), finalTs, r.gender || ""];
        sh.appendRow(rowToAppend);
      });
      SpreadsheetApp.flush(); // Ensure instantly saved
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);

    } else if (d.action === "addReg") {
      var r = d.data;
      var emailLC = (r.email || "").toLowerCase().trim();
      var eventNameLC = String(r.eventName || "").toLowerCase().trim();

      var incomingRegNos = [String(r.regno || "").toLowerCase().trim()];
      var tMembers = r.teamMembers || [];
      for (var k = 0; k < tMembers.length; k++) {
        var tmReg = String(tMembers[k].regno || "").toLowerCase().trim();
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
      var finalTs = "'" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");

      var rowToAppend = [r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventName, r.teamName || "", JSON.stringify(r.teamMembers || []), finalTs, r.gender || ""];
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
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);

  } catch (ex) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Server Error: " + ex.message })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
