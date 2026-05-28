import os
import re

src_dir = r"c:\Users\Lenovo\OneDrive\Desktop\mini project'\rakshakpath\src"

replacements = {
    "bg-gradient-to-r": "bg-linear-to-r",
    "bg-gradient-to-br": "bg-linear-to-br",
    "z-[1000]": "z-1000",
    "z-[400]": "z-400",
    "!p-3": "p-3!",
    "!bg-dark": "bg-dark!",
}

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Done.")
