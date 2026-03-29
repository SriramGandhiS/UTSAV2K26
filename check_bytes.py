# Check all /* */ comment pairs in the script section
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the script section
script_start = content.find('<script>')
if script_start == -1:
    print("No script tag found!")
    exit()

script_end = content.find('</script>', script_start)
js = content[script_start+8:script_end]

# Find all /* and */ in JS
opens = []
closes = []
i = 0
in_string = False
string_char = None
while i < len(js):
    c = js[i]
    
    # Track strings
    if not in_string and c in ('"', "'", '`'):
        in_string = True
        string_char = c
        i += 1
        continue
    if in_string and c == string_char and (i == 0 or js[i-1] != '\\'):
        in_string = False
        i += 1
        continue
    
    if not in_string:
        if js[i:i+2] == '/*':
            # Find the matching */
            close = js.find('*/', i+2)
            if close == -1:
                line_num = js[:i].count('\n') + 1
                context = js[i:i+100].replace('\n', '\\n')
                print(f"UNCLOSED COMMENT at line ~{line_num}: {context}")
            else:
                line_num = js[:i].count('\n') + 1
                comment = js[i:close+2]
                if len(comment) > 100:
                    comment = comment[:50] + '...' + comment[-50:]
                # print(f"  Comment at line ~{line_num}: {comment}")
                i = close + 2
                continue
        if js[i:i+2] == '//':
            # Single-line comment, skip to end of line
            nl = js.find('\n', i)
            if nl == -1:
                break
            i = nl + 1
            continue
    i += 1

# Also check for syntax errors by looking for unmatched braces etc.
print("\nChecking brace balance...")
brace_count = 0
paren_count = 0
bracket_count = 0
in_string = False
string_char = None
for i, c in enumerate(js):
    if not in_string and c in ('"', "'", '`'):
        in_string = True
        string_char = c
        continue
    if in_string and c == string_char and (i == 0 or js[i-1] != '\\'):
        in_string = False
        continue
    if not in_string:
        if c == '{': brace_count += 1
        elif c == '}': brace_count -= 1
        elif c == '(': paren_count += 1
        elif c == ')': paren_count -= 1
        elif c == '[': bracket_count += 1
        elif c == ']': bracket_count -= 1

print(f"Braces: {brace_count} (should be 0)")
print(f"Parens: {paren_count} (should be 0)")
print(f"Brackets: {bracket_count} (should be 0)")

# Check for the intro animation completion
idx = js.find('introShown')
if idx > -1:
    print(f"\nintroShown found at: {js[max(0,idx-50):idx+50]}")
else:
    print("\nWARNING: introShown not found!")
