#!/usr/bin/env python3
import re
import os

# Read the HTML file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract CSS (between <style> and </style>)
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if css_match:
    css_content = css_match.group(1)
    os.makedirs('css', exist_ok=True)
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    print(f'✅ CSS extracted: {len(css_content)} characters')

# Extract JavaScript (between <script> and </script>, but skip Firebase script tags)
# Find the main script block (after Firebase scripts)
script_start = content.find('<script>', content.find('</style>'))
script_end = content.rfind('</script>')
if script_start != -1 and script_end != -1:
    js_content = content[script_start + 8:script_end]
    os.makedirs('js', exist_ok=True)
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f'✅ JavaScript extracted: {len(js_content)} characters')

# Update HTML - replace <style> with <link> and <script> with external reference
updated_html = content

# Replace <style>...</style> with <link>
updated_html = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="/css/styles.css">', updated_html, flags=re.DOTALL)

# Replace main <script> with external reference (but keep Firebase scripts)
# Find the main script block
main_script_start = content.find('<script>', content.find('</style>'))
main_script_end = content.rfind('</script>')
if main_script_start != -1 and main_script_end != -1:
    before_script = updated_html[:main_script_start]
    after_script = updated_html[main_script_end + 9:]
    updated_html = before_script + '<script src="/js/app.js"></script>' + after_script

# Write updated HTML
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(updated_html)
print('✅ HTML updated with external CSS and JS references')
print('✅ Modular transformation complete!')
