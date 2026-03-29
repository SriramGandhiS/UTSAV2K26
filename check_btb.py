c = open('index.html', 'r', encoding='utf-8').read()
idx = c.find('function renderComm')
# Find end of function
depth = 0
started = False
end_idx = idx
for i in range(idx, min(idx+3000, len(c))):
    if c[i] == '{':
        depth += 1
        started = True
    elif c[i] == '}':
        depth -= 1
        if started and depth == 0:
            end_idx = i + 1
            break
print('renderComm @ char', idx, 'to', end_idx) 
print(c[idx:end_idx])
print()
# Also find COMMITTEE
cidx = c.find('COMMITTEE')
if cidx > -1:
    print('COMMITTEE found at', cidx)
    print(c[cidx:cidx+200])
else:
    print('No COMMITTEE found')
# Find comm-list div
clidx = c.find('comm-list')
if clidx > -1:
    print('comm-list at', clidx)
    print(c[max(0,clidx-50):clidx+100])
# Find comm-grid CSS
cgidx = c.find('.comm-grid')
if cgidx > -1:
    print('comm-grid CSS at', cgidx)
    print(c[cgidx:cgidx+200])
else:
    print('No comm-grid CSS')
