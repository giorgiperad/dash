const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const content = fs.readFileSync(htmlPath, 'utf8');

// Extract CSS
const cssMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) {
  const cssContent = cssMatch[1];
  const cssDir = path.join(__dirname, 'css');
  if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });
  fs.writeFileSync(path.join(cssDir, 'styles.css'), cssContent, 'utf8');
  console.log(`✅ CSS extracted: ${cssContent.length} characters`);
}

// Extract JavaScript (main script block after Firebase scripts)
const scriptStart = content.indexOf('<script>', content.indexOf('</style>'));
const scriptEnd = content.lastIndexOf('</script>');
if (scriptStart !== -1 && scriptEnd !== -1) {
  const jsContent = content.substring(scriptStart + 8, scriptEnd);
  const jsDir = path.join(__dirname, 'js');
  if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });
  fs.writeFileSync(path.join(jsDir, 'app.js'), jsContent, 'utf8');
  console.log(`✅ JavaScript extracted: ${jsContent.length} characters`);
}

// Update HTML - replace <style> with <link> and <script> with external reference
let updatedHtml = content;

// Replace <style>...</style> with <link>
updatedHtml = updatedHtml.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="/css/styles.css">');

// Replace main <script> with external reference (but keep Firebase scripts)
const firebaseScripts = content.match(/<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[\s\S]*?<\/script>/g);
const mainScriptStart = content.indexOf('<script>', content.indexOf('</style>'));
const mainScriptEnd = content.lastIndexOf('</script>');
if (mainScriptStart !== -1 && mainScriptEnd !== -1) {
  const beforeScript = updatedHtml.substring(0, mainScriptStart);
  const afterScript = updatedHtml.substring(mainScriptEnd + 9);
  updatedHtml = beforeScript + '<script src="/js/app.js"></script>' + afterScript;
}

fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
console.log('✅ HTML updated with external CSS and JS references');
console.log('✅ Modular transformation complete!');

