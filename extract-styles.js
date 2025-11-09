// ============================================
// STYLE EXTRACTOR TOOL
// Paste this in browser console (F12) on any website
// ============================================

// 1. Extract all styles from a selected element
function extractElementStyles(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.error('Element not found:', selector);
    return null;
  }
  
  const styles = window.getComputedStyle(element);
  const cssText = styles.cssText;
  
  console.log('=== ELEMENT STYLES ===');
  console.log('Selector:', selector);
  console.log('CSS Text:', cssText);
  console.log('\n=== INDIVIDUAL PROPERTIES ===');
  
  const importantProps = [
    'background', 'background-color', 'background-image',
    'color', 'font-family', 'font-size', 'font-weight',
    'padding', 'margin', 'border', 'border-radius',
    'width', 'height', 'display', 'flex-direction',
    'justify-content', 'align-items', 'gap',
    'box-shadow', 'backdrop-filter', 'opacity',
    'transform', 'transition', 'animation'
  ];
  
  importantProps.forEach(prop => {
    const value = styles.getPropertyValue(prop);
    if (value && value !== 'none' && value !== 'normal') {
      console.log(`${prop}: ${value}`);
    }
  });
  
  return cssText;
}

// 2. Extract color scheme from entire page
function extractColorScheme() {
  const colors = new Set();
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    const styles = window.getComputedStyle(el);
    const bg = styles.backgroundColor;
    const color = styles.color;
    const border = styles.borderColor;
    
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') colors.add(bg);
    if (color && color !== 'rgb(0, 0, 0)') colors.add(color);
    if (border && border !== 'rgba(0, 0, 0, 0)') colors.add(border);
  });
  
  console.log('=== COLOR SCHEME ===');
  Array.from(colors).forEach(color => console.log(color));
  return Array.from(colors);
}

// 3. Extract all CSS custom properties (CSS variables)
function extractCSSVariables() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const vars = {};
  
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i];
    if (prop.startsWith('--')) {
      vars[prop] = styles.getPropertyValue(prop).trim();
    }
  }
  
  console.log('=== CSS VARIABLES ===');
  Object.entries(vars).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  return vars;
}

// 4. Extract font information
function extractFonts() {
  const fonts = new Set();
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    const fontFamily = window.getComputedStyle(el).fontFamily;
    if (fontFamily) {
      fonts.add(fontFamily);
    }
  });
  
  console.log('=== FONTS USED ===');
  Array.from(fonts).forEach(font => console.log(font));
  return Array.from(fonts);
}

// 5. Extract all animations
function extractAnimations() {
  const animations = new Set();
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    const animation = window.getComputedStyle(el).animation;
    if (animation && animation !== 'none') {
      animations.add(animation);
    }
  });
  
  // Also check for @keyframes in stylesheets
  const keyframes = [];
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.type === CSSRule.KEYFRAMES_RULE) {
          keyframes.push({
            name: rule.name,
            cssText: rule.cssText
          });
        }
      });
    } catch (e) {
      // Cross-origin stylesheet, skip
    }
  });
  
  console.log('=== ANIMATIONS ===');
  Array.from(animations).forEach(anim => console.log(anim));
  console.log('\n=== KEYFRAMES ===');
  keyframes.forEach(kf => {
    console.log(`@keyframes ${kf.name}`);
    console.log(kf.cssText);
  });
  
  return { animations: Array.from(animations), keyframes };
}

// 6. Quick extract - get everything for an element you click
function quickExtract() {
  console.log('%c🎨 QUICK STYLE EXTRACTOR', 'font-size: 20px; font-weight: bold; color: #8b5cf6;');
  console.log('Click on any element to extract its styles...\n');
  
  document.addEventListener('click', function handler(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target;
    const selector = element.tagName.toLowerCase() + 
      (element.id ? '#' + element.id : '') +
      (element.className ? '.' + element.className.split(' ').join('.') : '');
    
    console.clear();
    console.log('%c📋 EXTRACTED STYLES', 'font-size: 16px; font-weight: bold; color: #22c55e;');
    console.log('Element:', element);
    console.log('Selector:', selector);
    console.log('\n');
    
    extractElementStyles(selector);
    
    document.removeEventListener('click', handler);
    console.log('\n%c✅ Extraction complete! Click again to extract another element.', 'color: #22c55e;');
  }, { once: true });
  
  console.log('✅ Ready! Click on any element now...');
}

// ============================================
// USAGE EXAMPLES:
// ============================================

// Example 1: Extract styles from specific element
// extractElementStyles('.carousel-card');

// Example 2: Get all colors used on page
// extractColorScheme();

// Example 3: Get all CSS variables
// extractCSSVariables();

// Example 4: Get all fonts
// extractFonts();

// Example 5: Get all animations
// extractAnimations();

// Example 6: Quick extract (click any element)
// quickExtract();

// ============================================
// AUTO-RUN: Uncomment the function you want to use
// ============================================

// Uncomment one of these to auto-run:
// quickExtract(); // Best for beginners - just click elements
// extractColorScheme();
// extractCSSVariables();

