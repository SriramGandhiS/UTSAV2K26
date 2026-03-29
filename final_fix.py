c = open('index.html', 'r', encoding='utf-8').read()

import re

# Find the start of the COMMITTEE array
comm_start = c.find('const COMMITTEE = [')
# Find the start of renderComm function
rc_start = c.find('function renderComm()')

if comm_start == -1 or rc_start == -1:
    print("Could not find COMMITTEE or renderComm")
    exit(1)

# Generate the new COMMITTEE array
new_comm = "const COMMITTEE = [\n"

heads = [
    ('Syedali Fathima', 'Head Coordinator', 'Brand to Billion'),
    ('Arikara Sudhan', 'Head Coordinator', 'Uno Reverse'),
    ('Hariharan', 'Head Coordinator', 'TechnoTrace'),
    ('Lekeetha Sri', 'Head Coordinator', 'Design Decode'),
    ('Kalaiselvi', 'Head Coordinator', 'Checkmate Coders'),
    ('Reshmaa', 'Head Coordinator', 'Zero Code Zone'),
    ('Sriram Adithya', 'Head Coordinator', 'Franchise Fiesta'),
    ('Priyanka M', 'Head Coordinator', 'Algorithmic Platter'),
    ('Jai Sri', 'Head Coordinator', 'Clash of Minds'),
    ('Pranaav', 'Head Coordinator', 'Hackverse')
]

subs = [
    ('Arjhun O', 'Joint President'),
    ('Arriram', 'Sub Coordinator'),
    ('Abinayaa', 'Sub Coordinator'),
    ('Abirami', 'Sub Coordinator'),
    ('Devadharshini', 'Sub Coordinator'),
    ('Dharshan', 'Sub Coordinator'),
    ('Deva Priyan', 'Sub Coordinator'),
    ('Hirthick', 'Treasurer'),
    ('Mathivadhana', 'Sub Coordinator'),
    ('Jeevesh', 'Sub Coordinator'),
    ('Naga Nandhini', 'Secretary'),
    ('Naren', 'Sub Coordinator'),
    ('Nitheesh', 'Sub Coordinator'),
    ('Sriram S', 'Website Admin'),
    ('Srinidhi', 'Sub Coordinator'),
    ('Sankari', 'Sub Coordinator')
]

def make_entry(name, role, isHead=False, event=''):
    color = "2ecc71" if isHead else "e8541a"
    img = f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background={color}&color=fff&size=128"
    dept = event if isHead else ''
    
    return f"  {{ isHead: {'true' if isHead else 'false'}, name: '{name}', role: '{role}', dept: '{dept}', img: '{img}', phone: '+910000000000', linkedin: '#' }}"

entries = []
for h in heads:
    entries.append(make_entry(h[0], h[1], True, h[2]))
for s in subs:
    entries.append(make_entry(s[0], s[1], False))

new_comm += ",\n".join(entries)
new_comm += "\n];\n\n    "

# Replace the old array with the new one
c = c[:comm_start] + new_comm + c[rc_start:]

open('index.html', 'w', encoding='utf-8').write(c)
print("Updated COMMITTEE array successfully.")
