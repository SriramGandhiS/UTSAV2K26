import re

# Read the clean file
with open('index.html', 'r', encoding='utf-8') as f:
    clean_html = f.read()

# Read the corrupted file to extract data
with open('old_index.html', 'r', encoding='utf-8', errors='replace') as f:
    old_html = f.read()

# Try to clean corrupted utf-8 by just fixing the known broken characters
def sanitize_text(text):
    text = text.replace('\u00e2\u00b0\u009f ', '')
    text = text.replace('\u00e2\u00b0\u009f', '')
    text = text.replace('\u00e2\u0080\u0093', '-')
    text = text.replace('\u00e2\u0080\u0094', '-')
    text = text.replace('\u00c2\u00b7', '|')
    text = text.replace('\u00e2\u0080\u0098', "'")
    text = text.replace('\u00e2\u0080\u0099', "'")
    text = text.replace('\u00e2\u0080\u009c', '"')
    text = text.replace('\u00e2\u0080\u009d', '"')
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009d', '-')
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c', '-')
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c\u00c2\u0090\u00c3\u00a2\u00e2\u0080\u009c\u00c2\u0090', '====')
    text = text.replace('\u00c3\u00a2\u00e2\u0080\u009c\u00c2\u0090', '=')
    text = text.replace('\u00c3\u00a2\u00c2\u008f\u00c2\u00b0\u00c3\u00af\u00c2\u00b8\u00c2\u008f', '')
    text = text.replace('\u00c3\u00a2\u00c2\u008f\u00c2\u00b0', '')
    text = text.replace('\u00c3\u00af\u00c2\u00b8\u00c2\u008f', '')
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac"', '-')
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u0093', '-')
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u0094', '-')
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u0098', "'")
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u0099', "'")
    text = text.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00c5\u0093', '"')
    text = text.replace('\u00c3\u0082\u00c2\u00b7', '|')
    text = text.replace('\u00c3\u0082\u00c2\u00a0', ' ')
    text = text.replace('\u00e2\u0080\u00a2', '-')
    text = text.replace('ï¿½', '')
    text = text.replace('', '')
    return text

# Extract EVS array from old file
# Look for "const EVS = [" until "];"
evs_start = old_html.find('const EVS = [')
evs_end = old_html.find('];', evs_start) + 2
if evs_start > -1 and evs_end > evs_start:
    evs_str = old_html[evs_start:evs_end]
    evs_str = sanitize_text(evs_str)
    
    # Replace in clean file
    clean_evs_start = clean_html.find('const EVS = [')
    clean_evs_end = clean_html.find('];', clean_evs_start) + 2
    if clean_evs_start > -1 and clean_evs_end > clean_evs_start:
        clean_html = clean_html[:clean_evs_start] + evs_str + clean_html[clean_evs_end:]
        print("Replaced EVS array.")

# Extract COMMITTEE array from old file
comm_start = old_html.find('const COMMITTEE = [')
comm_end = old_html.find('];', comm_start) + 2
if comm_start > -1 and comm_end > comm_start:
    comm_str = old_html[comm_start:comm_end]
    comm_str = sanitize_text(comm_str)
    
    # Check if COMMITTEE already exists in clean, if not inject it before /* ════════ STATE ════════ */
    clean_comm_start = clean_html.find('const COMMITTEE = [')
    if clean_comm_start > -1:
        clean_comm_end = clean_html.find('];', clean_comm_start) + 2
        clean_html = clean_html[:clean_comm_start] + comm_str + clean_html[clean_comm_end:]
        print("Replaced COMMITTEE array.")
    else:
        state_idx = clean_html.find('/* ════════ STATE ════════ */')
        if state_idx > -1:
            clean_html = clean_html[:state_idx] + comm_str + '\n\n    ' + clean_html[state_idx:]
            print("Inserted COMMITTEE array.")

# Extract the new members grid CSS
grid_desk_match = re.search(r'\.comm-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(180px,\s*1fr\)\);\s*gap:\s*20px;?\s*\}', old_html)
if grid_desk_match:
    print("Found updated desktop grid CSS.")
    # Find block in clean
    clean_grid = re.search(r'\.comm-grid\s*\{\s*display:\s*grid;[\s\S]*?\}', clean_html)
    if clean_grid:
        clean_html = clean_html[:clean_grid.start()] + grid_desk_match.group(0) + clean_html[clean_grid.end():]

grid_mob_match = re.search(r'\@media \(max-width: 600px\) \{[\s\S]*?\.comm-grid \{[\s\S]*?grid-template-columns: repeat\(2, 1fr\);[\s\S]*?gap: 12px;[\s\S]*?\}', old_html)
if grid_mob_match:
    print("Found updated mobile grid CSS.")
    mob_start = clean_html.find('@media (max-width: 600px) {')
    mob_grid = clean_html.find('.comm-grid {', mob_start)
    if mob_grid > -1:
        end_brace = clean_html.find('}', mob_grid) + 1
        new_mob_grid = "      .comm-grid {\n        grid-template-columns: repeat(2, 1fr);\n        gap: 12px;\n        padding-bottom: 40px;\n      }"
        clean_html = clean_html[:mob_grid] + new_mob_grid + clean_html[end_brace:]

# Fix renderComm function
render_comm_match = re.search(r'function renderComm\(\)\s*\{[\s\S]*?\}', old_html)
if render_comm_match:
    clean_render_comm = re.search(r'function renderComm\(\)\s*\{[\s\S]*?\}', clean_html)
    if clean_render_comm:
        # Sanitize it first
        rc_str = sanitize_text(render_comm_match.group(0))
        clean_html = clean_html[:clean_render_comm.start()] + rc_str + clean_html[clean_render_comm.end():]
        print("Replaced renderComm function.")

# Update the sub-nav date
clean_html = re.sub(r'2–4 April 2026', 'April 13 to April 18', clean_html)
# Update sub-nav date again just in case
clean_html = re.sub(r'>April 13, 15, 16 &amp; 18 · PSNA Campus<', '>April 13 to April 18 - PSNA Campus<', clean_html)
# Update hero badge Date
clean_html = re.sub(r'<div class="poster-dt">[^<]+</div>', '<div class="poster-dt">April 13 to April 18</div>', clean_html)
# Update ticker 
clean_html = re.sub(r"'APRIL 13, 15, 16, 18'", "'APRIL 13 TO APRIL 18'", clean_html)

# Also ensure renderComm is called in init()
init_match = re.search(r'function init\(\)\s*\{[\s\S]+?\}', clean_html)
if init_match and 'renderComm()' not in init_match.group(0):
    new_init = init_match.group(0).replace('renderTiles();', 'renderTiles(); renderComm();')
    clean_html = clean_html[:init_match.start()] + new_init + clean_html[init_match.end():]
    print("Added renderComm() to init().")

# Final sanity check: strip all bytes > 127 in EVS to be absolutely sure
def ensure_ascii(text):
    return ''.join(c if ord(c) < 128 else '' for c in text)

# Just write out the final clean HTML
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(clean_html)

print("Done generating updated clean file.")
