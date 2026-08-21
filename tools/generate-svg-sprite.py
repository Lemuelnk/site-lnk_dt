import os
import requests
import re

icons = [
    "behance", "calendar3", "clock-fill", "columns", "envelope-fill", 
    "envelope-heart", "facebook", "geo-alt-fill", "image", "instagram", 
    "linkedin", "list", "palette", "phone", "pinterest", "play-circle", 
    "shop", "threads", "tiktok", "twitter-x", "whatsapp", "youtube"
]

sprite_content = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n'

for icon in icons:
    url = f"https://raw.githubusercontent.com/twbs/icons/main/icons/{icon}.svg"
    print(f"Downloading {icon}...")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            svg_body = response.text
            # Remove svg tag and keep content, add id
            svg_body = re.sub(r'<svg[^>]*>', '', svg_body)
            svg_body = svg_body.replace('</svg>', '')
            sprite_content += f'  <symbol id="bi-{icon}" viewBox="0 0 16 16">\n{svg_body.strip()}\n  </symbol>\n'
        else:
            print(f"Failed to download {icon}: {response.status_code}")
    except Exception as e:
        print(f"Error downloading {icon}: {e}")

sprite_content += '</svg>'

output_path = "/home/ubuntu/site-lnk_dt/assets/images/icons-sprite.svg"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w") as f:
    f.write(sprite_content)

print(f"Sprite generated at {output_path}")
