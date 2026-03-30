import os
from PIL import Image

def crop_top(img_name, crop_percent):
    path = os.path.join("assets", "committee", img_name)
    if not os.path.exists(path):
        print(f"Not found: {path}")
        return
        
    try:
        with Image.open(path) as im:
            if im.mode == "RGBA":
                im = im.convert("RGB")
            width, height = im.size
            top_cut = int(height * crop_percent)
            left = 0
            top = top_cut
            right = width
            bottom = height
            
            cropped = im.crop((left, top, right, bottom))
            
            new_name = img_name.replace(".jpg.jpeg", "_hairtop.jpg.jpeg").replace(".jpeg", "_hairtop.jpeg").replace(".jpg", "_hairtop.jpg")
            if new_name == img_name:
                new_name = "hairtop_" + img_name
                
            new_path = os.path.join("assets", "committee", new_name)
            
            cropped.save(new_path, quality=95)
            
            print(f"Successfully cropped {img_name} -> {new_name}")
            return new_name
            
    except Exception as e:
        print(f"Error cropping {img_name}: {e}")

# Process the new batch!
crop_top("Hariharan.jpg.jpeg", 0.18)
crop_top("Syedali Fathima.jpg.jpeg", 0.18)
