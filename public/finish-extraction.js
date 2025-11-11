const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Remove all CSS content between <link rel="stylesheet" href="/css/styles.css"> and </head>
const linkTag = '<link rel="stylesheet" href="/css/styles.css">';
const linkIndex = content.indexOf(linkTag);
const headCloseIndex = content.indexOf('</head>', linkIndex);

if (linkIndex !== -1 && headCloseIndex !== -1) {
  // Find the end of the link tag line
  const linkEndIndex = content.indexOf('\n', linkIndex) + 1;
  
  // Remove everything between link tag and </head>
  const before = content.substring(0, linkEndIndex);
  const after = content.substring(headCloseIndex);
  
  content = before + after;
  
  fs.writeFileSync(htmlPath, content, 'utf8');
  console.log('✅ Removed CSS content from HTML');
} else {
  console.log('❌ Could not find CSS section to remove');
}

// Also check if we need to replace the main script tag
const scriptStart = content.indexOf('<script>', content.indexOf('</head>'));
const scriptEnd = content.lastIndexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1 && scriptStart < scriptEnd) {
  // Check if it's not a Firebase script
  const beforeScript = content.substring(0, scriptStart);
  const scriptContent = content.substring(scriptStart + 8, scriptEnd);
  
  // Only replace if it's the main script (not Firebase)
  if (!scriptContent.includes('firebase') && scriptContent.length > 1000) {
    const afterScript = content.substring(scriptEnd + 9);
    content = beforeScript + '<script src="/js/app.js"></script>' + afterScript;
    
    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('✅ Replaced main <script> tag with <script src>');
  }
}

console.log('✅ Extraction complete!');

