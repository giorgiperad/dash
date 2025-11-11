const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
const content = fs.readFileSync(filePath, 'utf8');

// Extract CSS
const cssStart = content.indexOf('<style>') + 7;
const cssEnd = content.indexOf('</style>');
const css = content.substring(cssStart, cssEnd);

// Create css directory if it doesn't exist
const cssDir = path.join(__dirname, 'css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

// Write CSS file
fs.writeFileSync(path.join(cssDir, 'styles.css'), css, 'utf8');
console.log('CSS extracted:', css.length, 'characters');

// Extract JavaScript
const scriptStart = content.indexOf('<script>', content.indexOf('</style>')) + 8;
const scriptEnd = content.lastIndexOf('</script>');
const js = content.substring(scriptStart, scriptEnd);

// Create js directory if it doesn't exist
const jsDir = path.join(__dirname, 'js');
if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}

// Write JavaScript file (we'll split it later)
fs.writeFileSync(path.join(jsDir, 'app-full.js'), js, 'utf8');
console.log('JavaScript extracted:', js.length, 'characters');

