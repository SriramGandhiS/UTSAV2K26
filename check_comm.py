import re
c = open('index.html', 'r', encoding='utf-8').read()
comm_start = c.find('const COMMITTEE = [')
print("COMMITTEE at:", comm_start)
rc_start = c.find('function renderComm()')
print("renderComm at:", rc_start)
print("\n--- Snippet around COMMITTEE ---")
print(c[max(0, comm_start-100) : comm_start+500])
