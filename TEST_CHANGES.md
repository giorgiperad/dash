# How to See the Changes

## Quick Checklist

### 1. **Deploy to Vercel**
The changes are in your local files, but they need to be deployed to Vercel to be visible online.

**Option A: Auto-deploy (if connected to Git)**
```bash
git add .
git commit -m "Add charts, responsive design, and API improvements"
git push
```
Vercel will automatically deploy when you push.

**Option B: Manual Deploy**
- Go to Vercel Dashboard
- Click on your project
- Go to "Deployments" tab
- Click "Redeploy" or push your code

### 2. **Clear Browser Cache**
After deployment, clear your browser cache:
- **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached images and files
- **Firefox**: Ctrl+Shift+Delete → Cached Web Content
- Or do a hard refresh: **Ctrl+F5** (Windows) or **Cmd+Shift+R** (Mac)

### 3. **Test the Features**

#### Test Price Charts:
1. Open your website
2. Wait for tokens to load
3. **Click on any token row** (the entire row should be clickable)
4. A modal should open with a price chart
5. Try different time ranges (1D, 7D, 30D, 90D, 1Y)

#### Test Responsive Design:
1. Open browser DevTools (F12)
2. Click the device toggle icon (or press Ctrl+Shift+M)
3. Try different screen sizes (iPhone, iPad, etc.)
4. The layout should adapt

#### Test API:
Open browser console (F12) and check:
- No JavaScript errors
- Chart.js library loads: Type `Chart` in console - should show the Chart object

### 4. **Verify Files Are Updated**

Check these in your code:
- ✅ `index.html` line 10: Should have Chart.js script tag
- ✅ `index.html` line 733: Token rows should have `onclick="showTokenChart(...)"`
- ✅ `index.html` line 1540+: Should have chart functions
- ✅ `api/history.js` should exist
- ✅ `api/rate-limit.js` should exist

### 5. **Common Issues**

**Charts not showing?**
- Check browser console for errors (F12)
- Verify Chart.js loads: `typeof Chart !== 'undefined'` in console
- Check network tab - `/api/history` should return data

**No clickable tokens?**
- Make sure `renderTokens()` function includes the onclick handler
- Check that `showTokenChart` function exists in global scope

**Mobile not responsive?**
- Clear cache and hard refresh
- Check that viewport meta tag is present: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

### 6. **Quick Test Script**

Open browser console (F12) and run:
```javascript
// Test 1: Check Chart.js
console.log('Chart.js loaded:', typeof Chart !== 'undefined');

// Test 2: Check function exists
console.log('showTokenChart exists:', typeof showTokenChart === 'function');

// Test 3: Test API
fetch('/api/history?id=bitcoin&days=7')
  .then(r => r.json())
  .then(d => console.log('API works:', d.prices ? 'Yes' : 'No'))
  .catch(e => console.error('API error:', e));
```

All three should return positive results.

## Still Not Working?

1. **Check Vercel Logs**: Go to Vercel Dashboard → Your Project → Functions → Check for errors
2. **Check Browser Console**: F12 → Console tab → Look for red errors
3. **Verify Deployment**: Make sure the latest code is actually deployed
4. **Check File Paths**: Make sure `index.html` is in the root or `public/` folder based on your Vercel config

