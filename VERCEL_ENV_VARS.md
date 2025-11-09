# Vercel Environment Variables Setup

## ✅ Your Firebase Credentials

Based on your service account email, here are the values to set in Vercel:

### Required Environment Variables:

1. **FIREBASE_PROJECT_ID**
   - Value: `ccx-tracker`
   - (Extracted from service account email: `firebase-adminsdk-fbsvc@ccx-tracker.iam.gserviceaccount.com`)

2. **FIREBASE_CLIENT_EMAIL**
   - Value: `firebase-adminsdk-fbsvc@ccx-tracker.iam.gserviceaccount.com`
   - (This is your service account email)

3. **FIREBASE_PRIVATE_KEY**
   - Value: Copy the entire `private_key` from your Firebase service account JSON file
   - Include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Replace actual newlines with `\n` when pasting into Vercel

4. **FIREBASE_DATABASE_URL**
   - Value: `https://ccx-tracker-default-rtdb.firebaseio.com/`
   - (Or your actual Realtime Database URL from Firebase Console)

## 📝 How to Set in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`ccx8`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click **"Add New"**
   - Enter variable name
   - Enter value
   - Select environments: **Production**, **Preview**, **Development**
   - Click **"Save"**

## 🔍 How to Get FIREBASE_PRIVATE_KEY:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **ccx-tracker**
3. Click gear icon ⚙️ → **Project Settings**
4. Go to **"Service Accounts"** tab
5. Click **"Generate New Private Key"** (or view existing)
6. Download the JSON file
7. Open JSON and copy the entire `private_key` value
8. When pasting into Vercel, replace actual newlines with `\n`

Example format:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----
```

## 🔍 How to Get FIREBASE_DATABASE_URL:

1. Firebase Console → **ccx-tracker** project
2. Go to **Realtime Database**
3. Copy the URL shown (usually: `https://ccx-tracker-default-rtdb.firebaseio.com/`)

## ✅ After Setting Variables:

1. **Redeploy** your project (or wait for auto-deploy)
2. **Test API:** Visit `https://ccx8.vercel.app/api/portfolio`
3. Should return JSON data or show specific error

## 🎯 Summary:

- ✅ Frontend updated to use `ccx-tracker` project ID
- ✅ Set `FIREBASE_PROJECT_ID` = `ccx-tracker` in Vercel
- ✅ Set `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@ccx-tracker.iam.gserviceaccount.com` in Vercel
- ⚠️ Still need: `FIREBASE_PRIVATE_KEY` and `FIREBASE_DATABASE_URL` from Firebase Console

