// ══════════════════════════════════════════
// UTSAV 2K26 — Google Apps Script (v3)
// ══════════════════════════════════════════
// INSTRUCTIONS:
// 1. Open your Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete ALL existing code
// 4. Paste THIS entire file
// 5. Click Deploy → Manage Deployments → Edit (pencil icon)
//    → Set Version to "New version" → Deploy
//    (OR: Deploy → New Deployment → Web App → Anyone → Deploy)
// 6. If you get a NEW URL, update SHEETS_URL in index.html
// ══════════════════════════════════════════

// ── GET requests (Admin Panel + Fetch Pass) ──
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Registrations");
  if (!sh) return ContentService.createTextOutput(JSON.stringify({found:false, registrations:[]})).setMimeType(ContentService.MimeType.JSON);

  var action = (e.parameter.action || "").trim();

  // Action: getRegs (for Admin Panel — returns ALL registrations)
  if (action === "getRegs") {
    var data = sh.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({registrations:[]})).setMimeType(ContentService.MimeType.JSON);
    }
    var headers = data[0];
    var results = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var teamMembersRaw = row[headers.indexOf("TeamMembers")] || "[]";
      var teamMembers = [];
      try { teamMembers = JSON.parse(teamMembersRaw); } catch(ex) { teamMembers = []; }
      results.push({
        regId: String(row[headers.indexOf("RegID")] || ""),
        name: String(row[headers.indexOf("Name")] || ""),
        regno: String(row[headers.indexOf("RegNo")] || ""),
        year: String(row[headers.indexOf("Year")] || ""),
        section: String(row[headers.indexOf("Section")] || ""),
        phone: String(row[headers.indexOf("Phone")] || ""),
        email: String(row[headers.indexOf("Email")] || ""),
        eventId: String(row[headers.indexOf("EventID")] || ""),
        eventName: String(row[headers.indexOf("Event")] || ""),
        teamName: String(row[headers.indexOf("TeamName")] || ""),
        teamMembers: teamMembers,
        ts: String(row[headers.indexOf("Timestamp")] || "")
      });
    }
    return ContentService.createTextOutput(JSON.stringify({registrations: results})).setMimeType(ContentService.MimeType.JSON);
  }

  // Action: lookup (for "Fetch My Pass" — finds registrations by email)
  if (action === "lookup") {
    var email = (e.parameter.email || "").toLowerCase().trim();
    if (!email) return ContentService.createTextOutput(JSON.stringify({found:false, registrations:[]})).setMimeType(ContentService.MimeType.JSON);

    var data = sh.getDataRange().getValues();
    var headers = data[0];
    var results = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowEmail = String(row[headers.indexOf("Email")] || "").toLowerCase().trim();
      if (rowEmail === email) {
        var teamMembersRaw = row[headers.indexOf("TeamMembers")] || "[]";
        var teamMembers = [];
        try { teamMembers = JSON.parse(teamMembersRaw); } catch(ex) {}
        results.push({
          regId: String(row[headers.indexOf("RegID")] || ("GF-" + (i+1))),
          name: String(row[headers.indexOf("Name")] || ""),
          regno: String(row[headers.indexOf("RegNo")] || ""),
          year: String(row[headers.indexOf("Year")] || ""),
          section: String(row[headers.indexOf("Section")] || ""),
          phone: String(row[headers.indexOf("Phone")] || ""),
          email: rowEmail,
          eventId: String(row[headers.indexOf("EventID")] || ""),
          eventName: String(row[headers.indexOf("Event")] || ""),
          teamName: String(row[headers.indexOf("TeamName")] || ""),
          teamMembers: teamMembers,
          ts: String(row[headers.indexOf("Timestamp")] || "")
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify({found: results.length > 0, registrations: results})).setMimeType(ContentService.MimeType.JSON);
  }

  // Unknown action
  return ContentService.createTextOutput(JSON.stringify({found:false, registrations:[]})).setMimeType(ContentService.MimeType.JSON);
}

// ── POST requests (Save registrations) ──
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Registrations") || ss.insertSheet("Registrations");
  if (sh.getLastRow() === 0) {
    sh.appendRow(["RegID","Name","RegNo","Year","Section","Phone","Email","EventID","Event","TeamName","TeamMembers","Timestamp"]);
  }
  var d = JSON.parse(e.postData.contents);

  if (d.action === "syncAll") {
    d.data.forEach(function(r) {
      sh.appendRow([r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventId||"", r.eventName, r.teamName||"", JSON.stringify(r.teamMembers||[]), r.ts]);
    });
  } else if (d.action === "addReg") {
    var r = d.data;
    sh.appendRow([r.regId, r.name, r.regno, r.year, r.section, r.phone, r.email, r.eventId||"", r.eventName, r.teamName||"", JSON.stringify(r.teamMembers||[]), r.ts]);
    // Send Confirmation Email
    try {
      var subject = "Registration Confirmed - " + r.eventName + " | UTSAV 2K26";
      var body = "Hi " + r.name + ",\n\nYour registration for " + r.eventName + " is confirmed!\n\nPass ID: " + r.regId + "\nDate: 28-29 March 2026\nVenue: PSNA College, Dindigul\n\nPlease show your digital pass at the registration desk.\n\nBest regards,\nUTSAV 2K26 Team";
      GmailApp.sendEmail(r.email, subject, body);
    } catch(ex) {}
  }
  return ContentService.createTextOutput("ok");
}
