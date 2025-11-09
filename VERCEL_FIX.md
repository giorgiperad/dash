# Vercel Runtime Error - Complete Fix Guide

## The Problem
Error: "Function Runtimes must have a valid version, for example `now-php@1.0.0`"

This happens because Vercel auto-detects the `functions/` directory and tries to process it as Vercel serverless functions, but it contains Firebase Cloud Functions code instead.

## Solutions (Try in Order)

### ✅ Solution 1: Current Configuration (Already Applied)
- ✅ Removed `version` field from vercel.json
- ✅ Removed any runtime specifications
- ✅ Added comprehensive .vercelignore patterns
- ✅ Vercel will auto-detect Node.js from package.json engines

**Status:** Configuration is correct. If error persists, try Solution 2.

### 🔧 Solution 2: Rename Functions Directory (RECOMMENDED)
Vercel checks directory names before reading .vercelignore, so renaming is the most reliable fix.

**Steps:**
1. Rename `functions/` to `firebase-functions/` (or `_functions/`)
2. Update any references to the old path
3. Commit and redeploy

**Windows PowerShell:**
```powershell
Rename-Item -Path "functions" -NewName "firebase-functions"
```

**Manual:**
- Right-click `functions` folder → Rename → `firebase-functions`

### 🔧 Solution 3: Check Vercel Dashboard Settings
1. Go to Vercel Dashboard → Your Project
2. Settings → General → "Build & Development Settings"
3. Check for any "Function Runtime" or "Runtime" settings
4. Remove/clear any runtime specifications
5. Clear Build Cache
6. Redeploy

### 🔧 Solution 4: Move Functions Outside Project
If you don't need the functions directory in the repo:
1. Move `functions/` outside the project root
2. Or create a separate repository for Firebase Functions
3. Update any deployment scripts

## Current Configuration Status

✅ `vercel.json` - Clean, no runtime specified
✅ `.vercelignore` - Comprehensive patterns to exclude functions/
✅ `package.json` - Has engines.node for auto-detection
✅ API functions - Correct ES module format

## Verification
After applying fixes:
1. Clear Vercel build cache
2. Redeploy
3. Check build logs for any runtime errors
4. Verify API endpoints work correctly

## If Still Failing
The most reliable solution is **Solution 2: Rename the directory**. Vercel's directory detection happens before ignore files are processed, so renaming is the only 100% reliable fix.

