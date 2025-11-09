# How to Extract Styles from Other Websites

## Method 1: Browser DevTools (Easiest)

### Step 1: Open DevTools
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I`
- **Safari**: Press `Cmd+Option+I` (need to enable Developer menu first)

### Step 2: Inspect Element
1. Right-click on any element you like
2. Select "Inspect" or "Inspect Element"
3. The element will be highlighted in the Elements/Inspector tab

### Step 3: Copy Styles
1. In the **Styles** panel (right side), you'll see all CSS rules
2. You can:
   - **Copy individual properties**: Click on a property value to edit/copy
   - **Copy entire rule**: Right-click on the CSS rule → "Copy rule"
   - **Copy all styles**: Right-click on the element in Elements tab → "Copy" → "Copy styles"

### Step 4: Get Computed Styles
1. In DevTools, go to **Computed** tab
2. See all final computed values (after all CSS is applied)
3. Useful for getting exact colors, sizes, etc.

## Method 2: Extract Color Scheme

### Using DevTools:
1. Inspect any colored element
2. Click on the color square next to `color` or `background-color`
3. Copy the hex/rgb value
4. Or use the color picker to select similar colors

### Using Browser Extensions:
- **ColorZilla** (Chrome/Firefox): Eye-dropper tool to pick colors
- **WhatFont** (Chrome): Identifies fonts and sizes
- **CSS Peeper** (Chrome): Shows all styles in a nice interface

## Method 3: Copy Entire CSS File

1. Open DevTools → **Network** tab
2. Refresh the page (`F5`)
3. Filter by "CSS" (type `css` in filter)
4. Click on any `.css` file
5. Go to **Response** or **Preview** tab
6. Copy the entire CSS content

## Method 4: Extract Specific Styles

### Get All Styles for an Element:
```javascript
// Paste this in Console (F12 → Console tab)
const element = document.querySelector('YOUR_SELECTOR');
const styles = window.getComputedStyle(element);
console.log(styles.cssText);
```

### Get All CSS Variables:
```javascript
// Get all CSS custom properties
const root = document.documentElement;
const styles = getComputedStyle(root);
const cssVars = {};
for (let prop of styles) {
  if (prop.startsWith('--')) {
    cssVars[prop] = styles.getPropertyValue(prop);
  }
}
console.log(cssVars);
```

### Get Font Family:
```javascript
const element = document.querySelector('YOUR_SELECTOR');
const font = window.getComputedStyle(element).fontFamily;
console.log(font);
```

## Method 5: Screenshot + CSS Extraction Tools

### Online Tools:
- **CSS Scan** (paid): One-click CSS extraction
- **PageSpeed Insights**: Shows used CSS
- **WebPageTest**: Detailed CSS analysis

### Browser Extensions:
- **CSS Peeper**: Visual CSS extraction
- **Stylebot**: Modify and copy styles
- **Web Developer**: Various CSS tools

## Method 6: Copy Layout Structure

1. Inspect element → Right-click → "Copy" → "Copy element"
2. This copies the HTML structure
3. Then inspect styles to get the CSS

## Method 7: Extract Animations

1. Inspect animated element
2. Look for `@keyframes` in Styles panel
3. Copy the animation rules
4. Or check Computed tab for `animation` property

## Practical Example: Copying from CoinAnk.com

1. **Open CoinAnk.com** in browser
2. **Press F12** to open DevTools
3. **Right-click** on a card you like → "Inspect"
4. **In Styles panel**, you'll see:
   ```css
   .card {
     background: rgba(20, 20, 30, 0.4);
     border-radius: 12px;
     padding: 20px;
     /* ... */
   }
   ```
5. **Copy the CSS** and paste into your project
6. **Adjust colors/sizes** to match your theme

## Tips:

✅ **Always check licenses** - Some sites have copyright on their design
✅ **Modify colors** - Don't copy exact colors, make it your own
✅ **Test responsiveness** - Copied styles might not work on mobile
✅ **Check dependencies** - Some styles require specific fonts/libraries
✅ **Simplify** - Remove unnecessary styles you don't need

## Quick Commands:

- **Find element by clicking**: Click the selector icon (top-left of DevTools) then click element
- **Search in styles**: `Ctrl+F` in Styles panel to search for specific properties
- **Toggle styles**: Click the checkbox next to CSS properties to see effect
- **Edit live**: Double-click any value in Styles panel to edit and see changes instantly

