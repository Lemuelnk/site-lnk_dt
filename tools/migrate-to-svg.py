import os
import re

def migrate_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern to match <i class="bi bi-icon-name"></i>
    # Handles variations in quotes and extra classes
    pattern = r'<i class="bi bi-([a-z0-9-]+)([^"]*)"[^>]*></i>'
    
    def replace_icon(match):
        icon_name = match.group(1)
        extra_classes = match.group(2).strip()
        cls = f"bi bi-{icon_name}"
        if extra_classes:
            cls += f" {extra_classes}"
        
        return f'<svg class="{cls}" aria-hidden="true"><use xlink:href="#bi-{icon_name}"></use></svg>'

    new_content = re.sub(pattern, replace_icon, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False

# Files to migrate
html_files = [f for f in os.listdir('.') if f.endswith('.html')]
migrated_count = 0

for html_file in html_files:
    if migrate_file(html_file):
        print(f"Migrated {html_file}")
        migrated_count += 1

print(f"Total files migrated: {migrated_count}")
