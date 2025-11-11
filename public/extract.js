const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
console.log('Reading from:', filePath);

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
console.log('File read, length:', content.length);

// Extract CSS
const cssMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (!cssMatch) {
  console.error('CSS not found in file');
  process.exit(1);
}
const css = cssMatch[1];

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

// Write JavaScript file
fs.writeFileSync(path.join(jsDir, 'app.js'), js, 'utf8');
console.log('✅ JavaScript extracted:', js.length, 'characters');

// Update HTML - replace <style>...</style> with <link>
let updatedHtml = content;
updatedHtml = updatedHtml.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="/css/styles.css">');
console.log('✅ Replaced <style> tag with <link>');

// Replace main <script> with external reference (but keep Firebase scripts)
const mainScriptStart = updatedHtml.indexOf('<script>', updatedHtml.indexOf('</style>'));
const mainScriptEnd = updatedHtml.lastIndexOf('</script>');
if (mainScriptStart !== -1 && mainScriptEnd !== -1) {
  const beforeScript = updatedHtml.substring(0, mainScriptStart);
  const afterScript = updatedHtml.substring(mainScriptEnd + 9);
  updatedHtml = beforeScript + '<script src="/js/app.js"></script>' + afterScript;
  console.log('✅ Replaced main <script> tag with <script src>');
}

fs.writeFileSync(filePath, updatedHtml, 'utf8');
console.log('✅ HTML updated with external CSS and JS references');
console.log('✅ Modular transformation complete!');

