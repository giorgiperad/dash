const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const cssDir = path.join(__dirname, 'css');
const jsDir = path.join(__dirname, 'js');

// Create directories
if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

// Read HTML
const html = fs.readFileSync(htmlPath, 'utf8');

// Find CSS start (after <link rel="stylesheet" href="/css/styles.css">)
const linkTag = '<link rel="stylesheet" href="/css/styles.css">';
const linkIndex = html.indexOf(linkTag);
if (linkIndex === -1) {
  console.error('❌ CSS link tag not found');
  process.exit(1);
}

// Find </head>
const headCloseIndex = html.indexOf('</head>', linkIndex);
if (headCloseIndex === -1) {
  console.error('❌ </head> tag not found');
  process.exit(1);
}

// Extract CSS (everything between link tag and </head>)
const cssStart = html.indexOf('\n', linkIndex) + 1;
const cssContent = html.substring(cssStart, headCloseIndex).trim();

// Write CSS
fs.writeFileSync(path.join(cssDir, 'styles.css'), cssContent, 'utf8');
console.log(`✅ CSS extracted: ${cssContent.length} characters`);

// Remove CSS from HTML
const htmlBeforeCSS = html.substring(0, linkIndex + linkTag.length);
const htmlAfterCSS = html.substring(headCloseIndex);
let newHtml = htmlBeforeCSS + '\n' + htmlAfterCSS;

// Find JavaScript (between <script> and </script> after </head>)
const bodyIndex = newHtml.indexOf('<body>');
const scriptStart = newHtml.indexOf('<script>', bodyIndex);
const scriptEnd = newHtml.lastIndexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1) {
  const jsContent = newHtml.substring(scriptStart + 8, scriptEnd).trim();
  
  // Write JavaScript
  fs.writeFileSync(path.join(jsDir, 'app.js'), jsContent, 'utf8');
  console.log(`✅ JavaScript extracted: ${jsContent.length} characters`);
  
  // Replace script with external reference
  const beforeScript = newHtml.substring(0, scriptStart);
  const afterScript = newHtml.substring(scriptEnd + 9);
  newHtml = beforeScript + '<script src="/js/app.js"></script>' + afterScript;
  console.log('✅ Replaced inline script with external reference');
}

// Write updated HTML
fs.writeFileSync(htmlPath, newHtml, 'utf8');
console.log('✅ HTML updated');
console.log('✅ Modular transformation complete!');

