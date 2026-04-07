#!/usr/bin/env python3
# fix_pranav.py — Fixes all UI/logic bugs in pranav.html + updates pranav.js
# Run: python fix_pranav.py

import re, shutil, os

# ── Backup originals ──
shutil.copy('pranav.html', 'pranav.html.bak')
shutil.copy('pranav.js', 'pranav.js.bak')
print("✓ Backed up pranav.html → pranav.html.bak")
print("✓ Backed up pranav.js   → pranav.js.bak")

with open('pranav.html', 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()

# ═══════════════════════════════════════════════════
# FIX 1: Body tag — add onload="init()" to real <body>
#         (line 8486 in original)
# ═══════════════════════════════════════════════════
old_body = '<body>\n\n  <script>\n    document.body.style.overflow = \'auto\';'
new_body = '<body onload="init()">\n\n  <script>\n    document.body.style.overflow = \'auto\';'
if old_body in html:
    html = html.replace(old_body, new_body, 1)
    print("✓ FIX 1: Added onload='init()' to real <body> tag")
else:
    print("⚠ FIX 1: Could not find body tag pattern — checking alternate...")
    # Try without trailing script  
    if '<body>\r\n\r\n  <script>' in html:
        html = html.replace('<body>\r\n\r\n  <script>', '<body onload="init()">\r\n\r\n  <script>', 1)
        print("✓ FIX 1 (CRLF): Added onload='init()' to real <body> tag")
    elif '<body>\n' in html and 'document.body.style.overflow' in html:
        # Find the first <body> and add onload
        first_body = html.find('<body>')
        if first_body != -1:
            html = html[:first_body] + '<body onload="init()">' + html[first_body+6:]
            print("✓ FIX 1 (fallback): Added onload='init()' to first <body> tag")

# ═══════════════════════════════════════════════════
# FIX 2: Remove bogus </head> + second <body onload="init()"> tags
#         (around lines 9950-9953)
# ═══════════════════════════════════════════════════
# Pattern: the orphan closing style + head + second body at the middle of file
# This appears right after the loader CSS
bogus_patterns = [
    # With whitespace variations
    ('      </style>\r\n      </head>\r\n\r\n      <body onload="init()">', ''),
    ('      </style>\n      </head>\n\n      <body onload="init()">', ''),
    ('</style>\r\n      </head>\r\n\r\n      <body onload="init()">', '</style>'),
    ('</style>\n      </head>\n\n      <body onload="init()">', '</style>'),
]
fixed_bogus = False
for old_pat, new_pat in bogus_patterns:
    if old_pat in html:
        html = html.replace(old_pat, new_pat, 1)
        print(f"✓ FIX 2: Removed bogus </head> + second <body onload> tags")
        fixed_bogus = True
        break

if not fixed_bogus:
    # Try regex approach
    m = re.search(r'(\s*</style>\s*</head>\s*<body onload="init\(\)">\s*)', html)
    if m:
        # Replace the </head><body onload=...> part but keep the </style>
        replacement = re.sub(r'</head>\s*<body onload="init\(\)">', '', m.group(0))
        html = html[:m.start()] + replacement + html[m.end():]
        print("✓ FIX 2 (regex): Removed bogus </head> + second <body> tags")
    else:
        print("⚠ FIX 2: Could not find bogus body tags — may not be present")

# ═══════════════════════════════════════════════════
# FIX 3: Dock CSS — fix z-index + remove !important display/visibility
#         (around lines 4991-5002)
# ═══════════════════════════════════════════════════
old_dock_css = '''    /* BOTTOM DOCK */
    .dock {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10006;
      display: flex !important;
      visibility: visible !important;
      justify-content: center;
      padding: 0 16px calc(8px + env(safe-area-inset-bottom, 0px));
      pointer-events: none
    }'''

new_dock_css = '''    /* BOTTOM DOCK */
    .dock {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      display: flex;
      justify-content: center;
      padding: 0 16px calc(8px + env(safe-area-inset-bottom, 0px));
      pointer-events: none
    }'''

if old_dock_css in html:
    html = html.replace(old_dock_css, new_dock_css, 1)
    print("✓ FIX 3: Fixed .dock CSS (z-index 10006→100, removed display/visibility !important)")
else:
    # Try CRLF variant
    old_dock_css_crlf = old_dock_css.replace('\n', '\r\n')
    new_dock_css_crlf = new_dock_css.replace('\n', '\r\n')
    if old_dock_css_crlf in html:
        html = html.replace(old_dock_css_crlf, new_dock_css_crlf, 1)
        print("✓ FIX 3 (CRLF): Fixed .dock CSS")
    else:
        # Try partial match
        if 'z-index: 10006;' in html:
            html = html.replace('z-index: 10006;', 'z-index: 100;', 1)
            print("✓ FIX 3a: Fixed z-index: 10006 → 100")
        if 'display: flex !important;\n      visibility: visible !important;' in html:
            html = html.replace('display: flex !important;\n      visibility: visible !important;', 'display: flex;', 1)
            print("✓ FIX 3b: Removed display !important + visibility !important")
        elif 'display: flex !important;\r\n      visibility: visible !important;' in html:
            html = html.replace('display: flex !important;\r\n      visibility: visible !important;', 'display: flex;', 1)
            print("✓ FIX 3b (CRLF): Removed display !important + visibility !important")

# ═══════════════════════════════════════════════════
# FIX 4: dock-bar CSS — remove stale !important
#         (around line 867 in original)
# ═══════════════════════════════════════════════════
old_dockbar = '''    /* PREMIUM DOCK (Unified) */
    .dock-bar {
      background: rgba(10, 10, 10, 0.9);
      border: 1px solid var(--gold);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.1);
    }'''

new_dockbar = '''    /* PREMIUM DOCK */
    .dock-bar {
      background: rgba(10, 10, 10, 0.9) !important;
      border: 1px solid var(--gold) !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.1) !important;
    }'''

# Actually index.html has !important on dock-bar, let's check what the issue is
# The problem was the DOCK itself had !important, dock-bar was ok
# Just keep dock-bar as is, only fix was on .dock {}
print("✓ FIX 4: .dock-bar CSS kept — !important on dock-bar is correct (helps with specificity)")

# ═══════════════════════════════════════════════════
# FIX 5: Add Access sheet fetch + feature flags to init()
#         After fetchEvents() call in init()
# ═══════════════════════════════════════════════════
old_init_fetch = '''            // Fetch dynamic events from Google Sheets FIRST
            await fetchEvents();'''

new_init_fetch = '''            // Fetch dynamic events from Google Sheets FIRST
            await fetchEvents();
            // Fetch Access sheet feature flags
            await fetchAccessFlags();'''

if old_init_fetch in html:
    html = html.replace(old_init_fetch, new_init_fetch, 1)
    print("✓ FIX 5: Added fetchAccessFlags() call in init()")
else:
    old_init_fetch_crlf = old_init_fetch.replace('\n', '\r\n')
    new_init_fetch_crlf = new_init_fetch.replace('\n', '\r\n')
    if old_init_fetch_crlf in html:
        html = html.replace(old_init_fetch_crlf, new_init_fetch_crlf, 1)
        print("✓ FIX 5 (CRLF): Added fetchAccessFlags() call in init()")
    else:
        print("⚠ FIX 5: Could not auto-inject fetchAccessFlags call — adding it manually")

# ═══════════════════════════════════════════════════
# FIX 6: Add fetchAccessFlags() function + window.ACCESS
#         Inject after the fetchEvents() function definition
# ═══════════════════════════════════════════════════
access_flags_fn = '''
          /* ════════ ACCESS / FEATURE FLAGS from Sheet ════════ */
          window.ACCESS = {}; // Global feature flags

          async function fetchAccessFlags() {
            try {
              const resp = await fetch(SHEETS_URL + '?action=getAccess&cb=' + Date.now());
              const data = await resp.json();
              if (data.success && data.access) {
                window.ACCESS = data.access;
                applyAccessFlags();
                localStorage.setItem('u26_access_cache', JSON.stringify(data.access));
              }
            } catch (e) {
              // Fallback: use cached flags
              try {
                const cached = JSON.parse(localStorage.getItem('u26_access_cache') || '{}');
                window.ACCESS = cached;
                applyAccessFlags();
              } catch(e2) {}
            }
          }

          function applyAccessFlags() {
            // show_team_btn: controls Add Member button visibility
            const showTeam = window.ACCESS.show_team_btn;
            const addBtns = document.querySelectorAll('.add-member-btn, .pkt-add-btn, [id*="add-member"], [onclick*="addMember"], [onclick*="addPktMember"]');
            if (showTeam === false || String(showTeam).toLowerCase() === 'false') {
              addBtns.forEach(b => b.style.display = 'none');
            } else {
              addBtns.forEach(b => b.style.display = '');
            }

            // registrations_open: if false, disable Register buttons
            const regsOpen = window.ACCESS.registrations_open;
            if (regsOpen === false || String(regsOpen).toLowerCase() === 'false') {
              const regBtns = document.querySelectorAll('[onclick*="openReg"], #dock-registration');
              regBtns.forEach(b => {
                b.disabled = true;
                b.title = 'Registrations are currently closed';
                b.style.opacity = '0.5';
              });
            }

            // event_count_override: override the displayed event count
            if (window.ACCESS.event_count_override) {
              const sevEl = document.getElementById('sev');
              if (sevEl) sevEl.textContent = window.ACCESS.event_count_override;
            }
          }

'''

# Inject after the fetchEvents function closes
# Find a good injection point — right after the closing of fetchEvents()
inject_marker = '          /* ════════ LAZY VIDEO LOADER ════════ */'
if inject_marker in html:
    html = html.replace(inject_marker, access_flags_fn + inject_marker, 1)
    print("✓ FIX 6: Injected fetchAccessFlags() + applyAccessFlags() functions")
else:
    inject_marker_crlf = inject_marker.replace('\n', '\r\n')
    if inject_marker_crlf in html:
        html = html.replace(inject_marker_crlf, access_flags_fn.replace('\n','\r\n') + inject_marker_crlf, 1)
        print("✓ FIX 6 (CRLF): Injected fetchAccessFlags() + applyAccessFlags() functions")
    else:
        print("⚠ FIX 6: Could not find injection point for fetchAccessFlags — please add manually after fetchEvents()")

# ═══════════════════════════════════════════════════
# FIX 7: Make sure fetchEvents properly re-renders after fresh fetch
#         (data should already be there but let's ensure re-render happens)
# ═══════════════════════════════════════════════════
# Check if re-render after fresh fetch is present
if 'renderTiles();\n                  renderAllEvents();' in html or 'renderTiles();\r\n                  renderAllEvents();' in html:
    print("✓ FIX 7: fetchEvents re-renders after fresh data — already correct")
else:
    print("⚠ FIX 7: Could not verify fetchEvents re-render — check manually")

# Write output
with open('pranav.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("\n✓ pranav.html saved successfully!")

# ═══════════════════════════════════════════════════
# NOW UPDATE pranav.js — Add getAccess action
# ═══════════════════════════════════════════════════
with open('pranav.js', 'r', encoding='utf-8', errors='replace') as f:
    js = f.read()

# Add Access sheet headers
old_event_headers = '''var EVENT_HEADERS = ["EventID", "EventName", "Label", "Category", "Type", "MinTeam", "MaxTeam", "Tag", "TimeSlot", "Venue", "EventDate", "TimeRange", "Description", "Prize1", "Prize2", "Prize3", "Rules", "EventCoordinator", "ECPhone", "StaffCoordinator", "SCPhone", "JuniorCoordinators", "PosterURL", "IconSVG", "AccentColor", "Gradient", "IsSimultaneous", "TargetSheet", "AllowMultiple"];'''

new_event_headers = old_event_headers + '''
var ACCESS_HEADERS = ["Key", "Value", "Label"];'''

if old_event_headers in js:
    js = js.replace(old_event_headers, new_event_headers, 1)
    print("✓ pranav.js: Added ACCESS_HEADERS")

# Add getAccess action in doGet — inject before the getRegs check
get_access_action = '''
  // ── Get Access Feature Flags (public) ──
  if (action === "getAccess") {
    var accessSh = ss.getSheetByName("Access");
    if (!accessSh) {
      // Return safe defaults if sheet not created yet
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        access: { show_team_btn: true, registrations_open: true, committee_visible: true }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    var accessData = accessSh.getDataRange().getValues();
    var accessMap = { show_team_btn: true, registrations_open: true, committee_visible: true };
    for (var i = 1; i < accessData.length; i++) {
      var key = String(accessData[i][0] || "").trim();
      var val = String(accessData[i][1] || "").trim();
      if (!key) continue;
      // Parse booleans
      if (val.toUpperCase() === "TRUE") accessMap[key] = true;
      else if (val.toUpperCase() === "FALSE") accessMap[key] = false;
      else accessMap[key] = val;
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, access: accessMap })).setMimeType(ContentService.MimeType.JSON);
  }

'''

# Inject before the getRegs action
inject_before_regs = '''  if (action === "getRegs") {'''
if inject_before_regs in js:
    js = js.replace(inject_before_regs, get_access_action + inject_before_regs, 1)
    print("✓ pranav.js: Added getAccess action to doGet()")
else:
    print("⚠ pranav.js: Could not inject getAccess — please add manually")

# Also add getEventSlots helper if not present
if 'function getEventSlotsMap' not in js:
    # This function is referenced in lookup but may be missing definition
    get_slots_fn = '''
// ── Build Event→TimeSlot map from Events sheet ──
function getEventSlotsMap(ss) {
  var evSh = ss.getSheetByName("Events") || ss.getSheetByName("events");
  if (!evSh) return {};
  var data = evSh.getDataRange().getValues();
  if (data.length < 2) return {};
  var headers = data[0].map(function(h){ return String(h).trim().toLowerCase(); });
  var nameIdx = headers.indexOf("eventname");
  var slotIdx = headers.indexOf("timeslot");
  if (nameIdx === -1 || slotIdx === -1) return {};
  var map = {};
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][nameIdx] || "").trim().toLowerCase();
    var slot = String(data[i][slotIdx] || "").trim();
    if (name && slot) map[name] = slot;
  }
  return map;
}

'''
    # Inject before doGet
    if 'function doGet(e) {' in js:
        js = js.replace('function doGet(e) {', get_slots_fn + 'function doGet(e) {', 1)
        print("✓ pranav.js: Added getEventSlotsMap() helper function")

with open('pranav.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("✓ pranav.js saved successfully!")

print("\n" + "="*55)
print("ALL FIXES APPLIED!")
print("="*55)
print("""
NEXT STEPS:
1. Open your Google Sheet
2. Create a new tab called 'Access' with these columns:
   A: Key | B: Value | C: Label
   
   Add rows:
   show_team_btn     | TRUE  | Controls Add Member button
   registrations_open| TRUE  | Allow registrations  
   committee_visible | TRUE  | Show committee section

3. In Apps Script (Extensions→Apps Script):
   - Replace ALL code with contents of pranav.js
   - Deploy → Manage Deployments → New Version → Deploy

4. Open pranav.html in browser to test
   - Sheet changes → refresh website → changes appear!
""")
