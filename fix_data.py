import pandas as pd
import json
import os

base = r"C:\Users\iamra\OneDrive\Desktop\Studntsdata"
students = []

# --- YEAR 1 ---
try:
    df1 = pd.read_excel(os.path.join(base, "I Year.xlsx"), header=None)
    for _, row in df1.iterrows():
        reg = str(row[1]).strip() if pd.notna(row[1]) else ''
        name = str(row[3]).strip() if pd.notna(row[3]) else ''
        sec = str(row[4]).strip() if pd.notna(row[4]) else ''
        if reg.startswith('25CS') or reg.isdigit(): # Some might be just digits
            if name[0].isalpha():
                students.append({"regno": reg, "name": name, "year": "1", "section": sec})
    print(f"Year 1: {len([s for s in students if s['year']=='1'])} students")
except Exception as e: print(f"Yr 1 Error: {e}")

# --- YEAR 2 ---
try:
    df2 = pd.read_excel(os.path.join(base, "II Year .xlsx"), header=None)
    for _, row in df2.iterrows():
        reg = str(row[1]).strip() if pd.notna(row[1]) else ''
        name = str(row[2]).strip() if pd.notna(row[2]) else ''
        sec = str(row[3]).strip() if pd.notna(row[3]) else ''
        if (reg.startswith('240392') or reg.isdigit()) and name[0].isalpha():
            students.append({"regno": reg, "name": name, "year": "2", "section": sec})
    print(f"Year 2: {len([s for s in students if s['year']=='2'])} students")
except Exception as e: print(f"Yr 2 Error: {e}")

# --- YEAR 3 ---
try:
    xl3 = pd.ExcelFile(os.path.join(base, "III - Year.xlsx"))
    for sheet in xl3.sheet_names:
        df3 = xl3.parse(sheet, header=None)
        count = 0
        for i, row in df3.iterrows():
            # Try columns 2,3 first
            r = str(row[2]).strip() if len(row) > 2 else ''
            n = str(row[3]).strip() if len(row) > 3 else ''
            if not r.startswith('230392'):
                # Try columns 3,4
                r = str(row[3]).strip() if len(row) > 3 else ''
                n = str(row[4]).strip() if len(row) > 4 else ''
            
            if r.startswith('230392') and n[0].isalpha() and len(n) > 2:
                students.append({"regno": r, "name": n, "year": "3", "section": sheet[0]})
                count += 1
        print(f"Year 3 Sheet {sheet}: {count} students")
except Exception as e: print(f"Yr 3 Error: {e}")

print(f"\nFinal TOTAL: {len(students)} students")

with open("students_master.json", "w") as f:
    json.dump(students, f, indent=2)
