const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'index.html');
console.log('Reading from:', htmlPath);

if (!fs.existsSync(htmlPath)) {
  console.error('File not found:', htmlPath);
  process.exit(1);
}

const content = fs.readFileSync(htmlPath, 'utf8');
console.log('File read, length:', content.length);

// Extract CSS
const cssMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) {
  const cssContent = cssMatch[1];
  const cssDir = path.join(__dirname, 'public', 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
    console.log('Created css directory');
  }
  fs.writeFileSync(path.join(cssDir, 'styles.css'), cssContent, 'utf8');
  console.log(`✅ CSS extracted: ${cssContent.length} characters`);
} else {
  console.log('❌ CSS not found');
}

// Extract JavaScript (main script block after Firebase scripts)
const scriptStart = content.indexOf('<script>', content.indexOf('</style>'));
const scriptEnd = content.lastIndexOf('</script>');
if (scriptStart !== -1 && scriptEnd !== -1) {
  const jsContent = content.substring(scriptStart + 8, scriptEnd);
  const jsDir = path.join(__dirname, 'public', 'js');
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
    console.log('Created js directory');
  }
  fs.writeFileSync(path.join(jsDir, 'app.js'), jsContent, 'utf8');
  console.log(`✅ JavaScript extracted: ${jsContent.length} characters`);
} else {
  console.log('❌ JavaScript not found');
}

// Update HTML - replace <style>...</style> with <link>
let updatedHtml = content;
const styleTagMatch = updatedHtml.match(/<style>[\s\S]*?<\/style>/);
if (styleTagMatch) {
  updatedHtml = updatedHtml.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="/css/styles.css">');
  console.log('✅ Replaced <style> tag with <link>');
}

// Replace main <script> with external reference (but keep Firebase scripts)
const mainScriptStart = updatedHtml.indexOf('<script>', updatedHtml.indexOf('</style>'));
const mainScriptEnd = updatedHtml.lastIndexOf('</script>');
if (mainScriptStart !== -1 && mainScriptEnd !== -1) {
  const beforeScript = updatedHtml.substring(0, mainScriptStart);
  const afterScript = updatedHtml.substring(mainScriptEnd + 9);
  updatedHtml = beforeScript + '<script src="/js/app.js"></script>' + afterScript;
  console.log('✅ Replaced main <script> tag with <script src>');
}

fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
console.log('✅ HTML updated with external CSS and JS references');
console.log('✅ Modular transformation complete!');

