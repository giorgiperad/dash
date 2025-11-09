# How to Get FIREBASE_DATABASE_URL

## What is FIREBASE_DATABASE_URL?

It's the URL/endpoint for your Firebase Realtime Database. It's used by the backend API to connect to your Firebase database.

## 🔍 How to Find It:

### Method 1: From Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ccx-tracker**
3. In the left sidebar, click **"Realtime Database"**
4. You'll see your database URL at the top, usually in this format:
   ```
   https://ccx-tracker-default-rtdb.firebaseio.com/
   ```
   or
   ```
   https://ccx-tracker-default-rtdb.firebaseio.com
   ```
5. **Copy this URL** - this is your `FIREBASE_DATABASE_URL`

### Method 2: From Project Settings

1. Firebase Console → **ccx-tracker** project
2. Click **gear icon** ⚙️ → **Project Settings**
3. Scroll down to **"Your apps"** section
4. If you have a web app configured, you'll see the database URL there
5. Or go to **Realtime Database** tab in the left sidebar

### Method 3: Standard Format

If you know your project ID (`ccx-tracker`), the URL is usually:
```
https://ccx-tracker-default-rtdb.firebaseio.com/
```

**Note:** 
- If your database is in a different region (not `us-central1`), the URL might be different
- If you're using Firestore instead of Realtime Database, you'll need to create/enable Realtime Database first

## ✅ What to Set in Vercel

**Variable Name:** `FIREBASE_DATABASE_URL`

**Value:** The URL you copied (usually ends with `/` or without, both work)

Example:
```
https://ccx-tracker-default-rtdb.firebaseio.com/
```

## 🔍 If You Don't Have Realtime Database Yet

1. Firebase Console → **ccx-tracker** project
2. Click **"Realtime Database"** in left sidebar
3. Click **"Create Database"** button
4. Choose location (usually `us-central1` or closest to you)
5. Choose security rules (start in **test mode** for development)
6. After creation, the URL will be displayed

## 📝 Quick Check

Your database URL should look like:
- ✅ `https://ccx-tracker-default-rtdb.firebaseio.com/`
- ✅ `https://ccx-tracker-default-rtdb.firebaseio.com`
- ❌ NOT `https://ccx-tracker.firebaseio.com/` (missing `-default-rtdb`)

The `-default-rtdb` part is important for Realtime Database URLs!

