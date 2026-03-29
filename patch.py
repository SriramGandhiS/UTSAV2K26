# Patch script
import re

with open('index.html', 'r', encoding='utf-8') as f:
    clean_html = f.read()

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
    text = text.replace('\xc2\x90\xc3\xa2', '')
    
    # Strip any remaining high bytes just to be safe in data
    res = ''
    for c in text:
        if ord(c) < 128 or c == '\u20b9': # keep rupees
            res += c
    return res

# Replace EVS
evs_start = old_html.find('const EVS = [')
evs_end = old_html.find('];', evs_start) + 2
evs_str = sanitize_text(old_html[evs_start:evs_end])

c_evs_start = clean_html.find('const EVS = [')
c_evs_end = clean_html.find('];', c_evs_start) + 2
clean_html = clean_html[:c_evs_start] + evs_str + clean_html[c_evs_end:]

# Replace COMMITTEE
comm_start = old_html.find('const COMMITTEE = [')
comm_end = old_html.find('];', comm_start) + 2
comm_str = sanitize_text(old_html[comm_start:comm_end])

cc_start = clean_html.find('const COMMITTEE = [')
if cc_start > -1:
    cc_end = clean_html.find('];', cc_start) + 2
    clean_html = clean_html[:cc_start] + comm_str + clean_html[cc_end:]

# Set CSS grid limits correctly manually (no regex to avoid swallowing braces)
old_grid_d = clean_html.find('.comm-grid {\n      display: grid;\n      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));')
if old_grid_d > -1:
    clean_html = clean_html.replace(
        '.comm-grid {\n      display: grid;\n      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));',
        '.comm-grid {\n      display: grid;\n      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));'
    )

old_grid_m = clean_html.find('grid-template-columns: repeat(2, 1fr);\n        gap: 16px;\n        padding-bottom: 40px;')
if old_grid_m > -1:
    clean_html = clean_html.replace(
        'grid-template-columns: repeat(2, 1fr);\n        gap: 16px;\n        padding-bottom: 40px;',
        'grid-template-columns: repeat(2, 1fr);\n        gap: 12px;\n        padding-bottom: 40px;'
    )

# Small fixes
clean_html = clean_html.replace('2\u20134 April 2026', 'April 13 to April 18')
clean_html = clean_html.replace('>April 13, 15, 16 &amp; 18 \u00b7 PSNA Campus<', '>April 13 to April 18 - PSNA Campus<')
clean_html = re.sub(r'<div class="poster-dt">[^<]+</div>', '<div class="poster-dt">April 13 to April 18</div>', clean_html)
clean_html = clean_html.replace("'APRIL 13, 15, 16, 18'", "'APRIL 13 TO APRIL 18'")

# Fix init()
if 'renderComm()' not in clean_html[clean_html.find('function init()'):clean_html.find('}', clean_html.find('function init()'))]:
    clean_html = clean_html.replace('renderTiles();', 'renderTiles();\n      renderComm();')

# Verify global syntax manually
brace = 0
for c in clean_html:
    if c == '{': brace += 1
    elif c == '}': brace -= 1
print('Final braces:', brace)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(clean_html)
print('Patch complete!')
