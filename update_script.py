import json
import os

# Load the master student data
with open('students_master.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Format into 2D array for Apps Script
rows = [[s['regno'], s['name'], s['year'], s['section']] for s in data]

# Load original Apps Script
with open('apps_script_code.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new function
new_func = f"""

/**
 * MASTER RUN: Run this once to import all {len(data)} corrected student records.
 */
function importAccurateData() {{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("AllStudents") || ss.insertSheet("AllStudents");
  sh.clear();
  sh.getRange(1, 1, 1, 4).setValues([["RegNo", "Name", "Year", "Section"]]);
  var data = {json.dumps(rows)};
  var batchSize = 400;
  for (var i = 0; i < data.length; i += batchSize) {{
    var batch = data.slice(i, i + batchSize);
    sh.getRange(i + 2, 1, batch.length, 4).setValues(batch);
  }}
  return "Successfully imported " + data.length + " students.";
}}
"""

# Replace the old manual data function
start_tag = 'function processManualData()'
start_idx = content.find(start_tag)

if start_idx != -1:
    content = content[:start_idx] + new_func
else:
    content = content + new_func

# Write updated Apps Script file
with open('apps_script_code.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully updated apps_script_code.js with {len(data)} students.")
