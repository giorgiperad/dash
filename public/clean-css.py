#!/usr/bin/env python3
import re

# Read the HTML file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the link tag
link_tag = '<link rel="stylesheet" href="/css/styles.css">'
link_index = content.find(link_tag)

if link_index == -1:
    print('❌ Link tag not found')
    exit(1)

# Find the end of the link tag line
link_end = content.find('\n', link_index)
if link_end == -1:
    link_end = link_index + len(link_tag)
link_end += 1  # Include the newline

# Find </head> after the link tag
head_close = content.find('</head>', link_index)

if head_close == -1:
    print('❌ </head> tag not found')
    exit(1)

# Remove everything between link tag and </head>
before = content[:link_end]
after = content[head_close:]

new_content = before + after

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'✅ Removed {head_close - link_end} characters of CSS from HTML')
print('✅ HTML cleaned!')

