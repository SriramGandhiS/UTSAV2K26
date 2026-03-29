import PyPDF2
import os

for fname in ['sympo_schedule.pdf', 'Symposium 2026.pdf']:
    fpath = os.path.join(r'C:\Users\iamra\OneDrive\Desktop\shedule', fname)
    print(f'\n===== {fname} =====')
    try:
        reader = PyPDF2.PdfReader(fpath)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                print(f'\n--- Page {i+1} ---')
                print(text)
    except Exception as e:
        print(f'Error: {e}')
