import sys
import re

filename = "c:/Users/iamra/OneDrive/Desktop/utsaA/index.html"

try:
    with open(filename, "r", encoding="utf-8") as f:
        text = f.read()

    print('CSE UTSAV:', len(re.findall(r'CSE\s+UTSAV', text, flags=re.IGNORECASE)))
    print('40K+:', text.count('40K+'))
    print('₹40,000:', text.count('₹40,000'))
    print('40,000:', text.count('40,000'))

    # Replace space dynamically
    text = re.sub(r'(?i)CSE\s+UTSAV', 'CSEUTSAV', text)
    text = text.replace('40K+', '33K+')
    text = text.replace('₹40,000', '₹33,000')
    text = text.replace('40,000', '33,000')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(text)

    print("Replacements completed.")
except Exception as e:
    print(f"Error: {e}")
