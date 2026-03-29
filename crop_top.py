import os
from PIL import Image

def crop_top(img_name, crop_percent):
    path = os.path.join("assets", "committee", img_name)
    if not os.path.exists(path):
        print(f"Not found: {path}")
        return
        
    try:
        with Image.open(path) as im:
            width, height = im.size
            top_cut = int(height * crop_percent)
            left = 0
            top = top_cut
            right = width
            bottom = height
            
            cropped = im.crop((left, top, right, bottom))
            
            new_name = img_name.replace(".jpg", "_hairtop.jpg").replace(".jpeg", "_hairtop.jpeg")
            if new_name == img_name:
                new_name = "hairtop_" + img_name
                
            new_path = os.path.join("assets", "committee", new_name)
            
            # Save the cropped image
            if cropped.mode == "RGBA":
                cropped = cropped.convert("RGB")
            cropped.save(new_path, quality=95)
            
            print(f"Successfully cropped {img_name} -> {new_name}")
            return new_name
            
    except Exception as e:
        print(f"Error cropping {img_name}: {e}")

# Process the new batch!
crop_top("abirami_cropped.jpg", 0.15)
crop_top("Ariram .jpg.jpeg", 0.15)
crop_top("priyanka_portrait.jpg", 0.15)
crop_top("hrithik_cropped.jpg", 0.15)
# Re-process Aravind from the newly replaced original image
crop_top("aravind.jpeg", 0.15)
