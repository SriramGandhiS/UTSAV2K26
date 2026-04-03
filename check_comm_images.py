import os
import re

committee_data = [
    {'name': 'Pranav', 'img': 'assets/committee/pranav_final.jpg'},
    {'name': 'Aravind', 'img': 'assets/committee/aravind_hairtop.jpeg'},
    {'name': 'Lekeetha Sri', 'img': 'assets/committee/lekeetha_cropped.jpg'},
    {'name': 'Arjhun O', 'img': 'assets/committee/arjun_portrait.jpg'},
    {'name': 'Naga Nandhini', 'img': 'assets/committee/naga_nandhini_cropped.jpg'},
    {'name': 'Hrithik', 'img': 'assets/committee/hrithik_cropped_hairtop.jpg'},
    {'name': 'Sriram S', 'img': 'assets/committee/sriram_cropped.jpg'},
    {'name': 'Hariharan', 'img': 'assets/committee/Hariharan_final.jpg'},
    {'name': 'Arikara Sudhan', 'img': 'assets/committee/arikara_sudhan_portrait.jpg'},
    {'name': 'Syedali Fathima', 'img': 'assets/committee/Syedali Fathima.jpg.jpeg'},
    {'name': 'Kalaiselvi', 'img': 'assets/committee/kalaiselvi_portrait.jpg'},
    {'name': 'Reshmaa', 'img': 'assets/committee/reshmaa_cropped.jpg'},
    {'name': 'Priyanka M', 'img': 'assets/committee/priyanka_portrait_hairtop.jpg'},
    {'name': 'Jaya Dharshini', 'img': 'assets/committee/jeya_dharshini_cropped.jpg'},
    {'name': 'Arriram', 'img': 'assets/committee/Ariram _hairtop.jpg_hairtop.jpeg'},
    {'name': 'Abinayaa', 'img': 'assets/committee/abinayaa_cropped.jpg'},
    {'name': 'Adharsini', 'img': 'assets/committee/adarshini_v9.jpg'},
    {'name': 'Abirami', 'img': 'assets/committee/abirami_medium.jpg'},
    {'name': 'Devadharshini', 'img': 'assets/committee/devadharshini_cropped.jpg'},
    {'name': 'Dharshan', 'img': 'assets/committee/Dharshan_hairtop.jpeg'},
    {'name': 'Dhanusiya', 'img': 'assets/committee/dhanushya_cropped.jpg'},
    {'name': 'Deva Priyan', 'img': 'assets/committee/Devapriyan.jpg'},
    {'name': 'Mathivadhana', 'img': 'assets/committee/mathivadhana_cropped.jpg'},
    {'name': 'Jeevesh', 'img': 'assets/committee/jeevesh_cropped.jpg'},
    {'name': 'Meeran', 'img': 'assets/committee/meeran.jpeg'},
    {'name': 'Raghul', 'img': 'assets/committee/raghul_cropped.jpg'},
    {'name': 'Naren', 'img': 'assets/committee/naren_v9.jpg'},
    {'name': 'Nitheesh', 'img': 'assets/committee/nitheesh_cropped.jpeg'},
    {'name': 'Naresh Balaji', 'img': 'assets/committee/naresh_balaji_vFinal.jpg'},
    {'name': 'Srinidhi', 'img': 'assets/committee/srinidhi_cropped.jpg'},
    {'name': 'Sankari', 'img': 'assets/committee/sankari_cropped.jpg'},
    {'name': 'Sudharsan', 'img': 'assets/committee/Sudharsan.jpeg'},
    {'name': 'Vijay Kasthuri', 'img': 'assets/committee/vijay_kasthuri_cropped.jpg'},
    {'name': 'Vinuvarsan', 'img': 'assets/committee/vinuvarsan_cropped.jpg'},
    {'name': 'Sanjay Kumar KS', 'img': 'assets/committee/sanjay_ks_cropped.jpg'},
    {'name': 'Sanjay Kumar M', 'img': 'assets/committee/sanjay_m.jpg'},
    {'name': 'Naveen Sakthi', 'img': 'assets/committee/naveen.jpg'},
    {'name': 'Nithish Priyan', 'img': 'assets/committee/nithish_priyan_cropped_hairtop.jpg'},
    {'name': 'Paxton', 'img': 'assets/committee/paxton_cropped_hairtop.jpg'},
    {'name': 'Jai Sankar', 'img': 'assets/committee/jaisankar_cropped.jpg'},
    {'name': 'Kalimuthu', 'img': 'assets/committee/kalimuthu_cropped.jpg'}
]

base_path = r'c:\Users\iamra\OneDrive\Desktop\utsaA\assets\committee'
files = os.listdir(base_path)

print("Checking for missing images...")
for member in committee_data:
    img_path = member['img']
    img_name = os.path.basename(img_path)
    if img_name not in files:
        print(f"MISSING: {member['name']} -> {img_name}")
        # Check for case sensitivity issues
        lower_files = [f.lower() for f in files]
        if img_name.lower() in lower_files:
            idx = lower_files.index(img_name.lower())
            print(f"  (Case mismatch found: {files[idx]})")
        else:
            # Check for partial matches
            matches = [f for f in files if member['name'].lower() in f.lower()]
            if matches:
                print(f"  (Suggested matches: {matches})")

print("\nDone.")
