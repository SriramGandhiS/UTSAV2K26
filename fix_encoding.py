with open('index.html', 'rb') as f:
    data = f.read()

print(f"Before: {len(data)} bytes")

# Pattern: the box-drawing char sequences in comments like /* ════════ TITLE ════════ */
# After double-encoding, \xe2\x95\x90 (═) became \xc3\xa2\xc2\x95\xc2\x90
# But our earlier fixes may have already stripped some bytes, leaving orphans
# The scan shows the dominant pattern is: \xc2\x90\xc3\xa2 (536x)

# Strategy: just strip ALL bytes > 127 that aren't part of valid content
# We know the only legitimate non-ASCII content is:
# - \\u20b9 escape sequences for rupee (these are ASCII backslash-u)
# - Everything else should be plain ASCII now

# Simply strip all non-ASCII bytes
result = bytearray()
i = 0
while i < len(data):
    b = data[i]
    if b <= 127:
        result.append(b)
        i += 1
    else:
        # Check what this non-ASCII sequence is near
        # Skip the entire non-ASCII run
        while i < len(data) and data[i] > 127:
            i += 1
        # Don't add anything - these are all corrupted decoration chars
i += 1

with open('index.html', 'wb') as f:
    f.write(bytes(result))

print(f"After: {len(result)} bytes")

# Verify
remaining = sum(1 for b in result if b > 127)
print(f"Remaining non-ASCII: {remaining}")
print("DONE - all non-ASCII bytes stripped!")
