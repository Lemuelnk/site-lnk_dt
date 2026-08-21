import os
from PIL import Image

def optimize_image(filepath):
    try:
        with Image.open(filepath) as img:
            original_size = os.path.getsize(filepath)
            
            # Max width for portfolio thumbnails is around 800px
            if img.width > 1200:
                ratio = 1200 / float(img.width)
                new_height = int(float(img.height) * float(ratio))
                img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
            
            # Save as WebP with optimized quality
            img.save(filepath, "WEBP", quality=75, method=6)
            
            new_size = os.path.getsize(filepath)
            print(f"Optimized {filepath}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB")
    except Exception as e:
        print(f"Error optimizing {filepath}: {e}")

portfolio_dir = "/home/ubuntu/site-lnk_dt/assets/images/portfolio"
for root, dirs, files in os.walk(portfolio_dir):
    for file in files:
        if file.lower().endswith(".webp"):
            optimize_image(os.path.join(root, file))
