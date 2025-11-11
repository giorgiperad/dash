const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Find the link tag and </head>
const linkTag = '<link rel="stylesheet" href="/css/styles.css">';
const linkIndex = content.indexOf(linkTag);

if (linkIndex === -1) {
  console.log('❌ Link tag not found');
  process.exit(1);
}

// Find the end of the link tag line
let linkEndIndex = content.indexOf('\n', linkIndex);
if (linkEndIndex === -1) linkEndIndex = linkIndex + linkTag.length;
linkEndIndex += 1; // Include the newline

// Find </head> after the link tag
const headCloseIndex = content.indexOf('</head>', linkIndex);

if (headCloseIndex === -1) {
  console.log('❌ </head> tag not found');
  process.exit(1);
}

// Remove everything between link tag and </head>
const before = content.substring(0, linkEndIndex);
const after = content.substring(headCloseIndex);

content = before + after;

fs.writeFileSync(htmlPath, content, 'utf8');
console.log(`✅ Removed ${headCloseIndex - linkEndIndex} characters of CSS from HTML`);
console.log('✅ HTML cleaned!');

