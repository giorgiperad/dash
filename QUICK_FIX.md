# Quick Fix Guide - See Your Changes

## The Problem
Changes are in your code files but not visible on the website.

## Solution Steps

### Step 1: Deploy to Vercel

**If using Git:**
```bash
git add .
git commit -m "Add charts and improvements"
git push
```

**If not using Git:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project
3. Go to "Deployments" tab
4. Click "Redeploy" or drag & drop your project folder

### Step 2: Clear Browser Cache

**Windows:**
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"
- Or just press `Ctrl + F5` for hard refresh

**Mac:**
- Press `Cmd + Shift + R` for hard refresh

### Step 3: Test the Features

1. **Open your website** (after deployment)
2. **Open Browser Console** (Press F12)
3. **Check for errors** - Should see no red errors
4. **Test Chart.js**: Type `Chart` in console - should show object
5. **Click a token row** - Should open chart modal

### Step 4: Verify Changes

**Check these in browser:**
1. Right-click → "View Page Source"
2. Search for "chart.js" - Should find it in the `<head>`
3. Search for "showTokenChart" - Should find the function
4. Check Network tab (F12) - Should see `/api/history` requests

## Quick Test

Open browser console (F12) and paste:

```javascript
// Test if everything is loaded
console.log('Chart.js:', typeof Chart !== 'undefined' ? '✅ Loaded' : '❌ Missing');
console.log('showTokenChart:', typeof showTokenChart === 'function' ? '✅ Loaded' : '❌ Missing');

// Test API
fetch('/api/history?id=bitcoin&days=7')
  .then(r => r.json())
  .then(d => console.log('API:', d.prices ? '✅ Working' : '❌ Failed', d))
  .catch(e => console.error('API Error:', e));
```

All should show ✅ if working correctly.

## Common Issues

**"Chart is not defined"**
- Chart.js didn't load - check internet connection
- CDN might be blocked - check browser console

**"showTokenChart is not a function"**
- Code not deployed yet
- Browser cache - do hard refresh (Ctrl+F5)

**"Cannot GET /api/history"**
- API not deployed
- Check Vercel Functions tab for errors
- Make sure `api/history.js` exists

**Nothing happens when clicking token**
- Check browser console for errors
- Verify onclick handler is in the HTML
- Try clicking directly on the token name/icon

## Still Not Working?

1. **Check Vercel Logs**: Dashboard → Project → Functions → View logs
2. **Check File Structure**: Make sure files are in correct folders
3. **Verify Deployment**: Check deployment status in Vercel
4. **Test Locally**: Run `vercel dev` to test locally first

## Files That Should Exist

- ✅ `index.html` (with Chart.js script tag)
- ✅ `api/history.js`
- ✅ `api/rate-limit.js`
- ✅ `api/utils/validation.js`

If any are missing, the features won't work!

