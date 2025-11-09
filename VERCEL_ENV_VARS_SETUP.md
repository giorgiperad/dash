# Vercel Environment Variables - Exact Values

## 📋 Copy These Values to Vercel

Go to: **Vercel Dashboard → Your Project (`ccx8`) → Settings → Environment Variables**

### 1. FIREBASE_PROJECT_ID
**Value:**
```
ccx-tracker
```

### 2. FIREBASE_CLIENT_EMAIL
**Value:**
```
firebase-adminsdk-fbsvc@ccx-tracker.iam.gserviceaccount.com
```

### 3. FIREBASE_PRIVATE_KEY
**Value:** (Copy the entire key below - it already has `\n` for newlines)
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCE2/+GhdXXehZ\np7DkZfvQfflSAiBbkulRX/QwsHK92wIbqPgSehNizbRMtwQRNAKz/Z7s/rGJ6xp/\nGlxE9e8Gc4wNZlMSXSglHx7xV/9MrYnN79S0mDvkonL8n1+WqFvzD3fcSNLcHV9f\nyG4cbzPuEyBTBgax5La/93kGkae9aophvRDWslPaOEVTkzuSBKw74z0dryJYrs1W\nV+vEFB8PkBbOxVIQmO/mLCjiBXPoD/4Npd5e6d7aPecYF2LpUCOsPcNrRunwIpdv\nITa1HpLJoG8ZnKfBR3ph0AfFsO7zRwGjYhpyhFIzihKKy2e9wyWOHJTWELh/Bqgh\nxSL1qtSTAgMBAAECggEALZmQklVCD7qWWd5vTzLxKEs5Ff4+6RVLMd4IS5ph018O\njz4zz2+Ud34as326/GnKisz4Fvo+78doSd4BOQjJ+SuUCB/3O9TclmBKDm3dJACQ\nZO1JfodYZz+OIfI2bPkw5ZrIUF9h/+r82k4HJTIxsuoWibtcPlcdY1x7uMHndjcV\nz0oKRA8RdzeEWwa5EsPEMbenGPvMwJEpa/QPiAyqZUxAn9ejjSWs1lAVunUS+dsR\nE+l513oZiFIVp1GuIrVajqgaWQ0Mi+ExVHMChjuGti1drarZHDr7GqrVLpyItQqF\nI7rHLmhrSnWU2mvheku/2XQhp53OaUgDWjtDuUJl2QKBgQDskzbtVzxT3AkzWxS3\n+KfryLzB/Xr6AVp6MNnP7ohtLnI5KgWKRj5gEQbnsKoVMTpds9ZAQVgoNJvJP7Ka\n/K6OLGGyJR6S1yTwZYUn9iW26LuWVdnRu7pmosdRHUWfM7tIU93krulejq6tpPCO\nJVsbiE8BDwKUUGehleA1cxxO2QKBgQDSAuUsrnqr0vnNcRURgH51qZuoMaMCVq60\n7snRt9Vi0/9AjWldj25WaPnt4l3U4sYMw0VRgiBfVXcw9zPatmJOCWdkp3ckHkYK\n5KnIL3sd3jdNAZBmRGRdgkVOSX7ECfBaGnnLwpCGSWnQtf72Dey6qO2FN9+EHX2K\nZS5WEG6zSwKBgAnZ43qknE19pyBtVYKHpy5pUHrffER20/asnBVNgH7TZUw+FLb6\nT9SeQORa9eol/6ExQOWyEuKxth7+OQi9JuOis3rAkvJYZSBhidbtKArizBTphEV4\nhL2LX7Nf/aswc0cCvwWrxun6FQoECURSB+YwmeGYZ2oXowkWfZycK3yZAoGAQL1p\nvpNu94cLQNzKXOHamhUWCgx7Lt5f7yDpkD/2hQfLWS/+ujvcDMFBwqaUvGrIGOkd\ndloB9sGXA75A+vxcY6gcenfxj23Rs8v31uFkN7noHFIOHKiatATTrqWTcYWK1Yvx\n3fF1sh/xgciI93slbgljZzzpJ4YbzE0Ssq9QIO8CgYEA5q4n4tZz9gy6x0UpLhDo\nWnxJRLFjA82H+76LLfXJzQaJanOuokMsfVIAfNW6Vm+AlgYQvoCOa6F/9rIefM+N\n17Ib1S03LEaZt0FtXne6x4nl0Yosf6YZY9v7C6p6s+Lm6EsH5Ql4xy1wRtRheubm\nZV2UU6+yA+h6jPhMjz5hkbE=\n-----END PRIVATE KEY-----\n
```

### 4. FIREBASE_DATABASE_URL
**Value:** (Get from Firebase Console → Realtime Database)
```
https://ccx-tracker-default-rtdb.firebaseio.com/
```
*(If your database URL is different, use the actual URL from Firebase Console)*

## 📝 Step-by-Step Instructions

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select project: `ccx8`

2. **Navigate to Environment Variables:**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add Each Variable:**
   For each of the 4 variables above:
   - Click **"Add New"** button
   - **Key:** Enter variable name (e.g., `FIREBASE_PROJECT_ID`)
   - **Value:** Paste the value from above
   - **Environments:** Select all (Production, Preview, Development)
   - Click **"Save"**

4. **Important for FIREBASE_PRIVATE_KEY:**
   - The key above already has `\n` for newlines
   - Copy it exactly as shown
   - Don't add extra spaces or line breaks

5. **Redeploy:**
   - After setting all variables, go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger auto-deploy

## ✅ Verification

After redeploying, test:
- Visit: `https://ccx8.vercel.app/api/portfolio`
- Should return JSON with crypto data
- If error, check Vercel Function Logs for details

## 🎯 Summary

✅ Frontend already updated to use `ccx-tracker`  
✅ All values ready to copy from this file  
⚠️ Just need to paste them into Vercel Environment Variables  
⚠️ Don't forget FIREBASE_DATABASE_URL (get from Firebase Console)

