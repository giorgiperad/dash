# Firebase Configuration Guide

## ⚠️ Important: Email and Project ID Must Match

### 1. Frontend Firebase Config (index.html)
**Location:** Line 307 in `index.html`
```javascript
const firebaseConfig = { projectId: "ccx-dashboard" };
```

**This must match your actual Firebase project ID!**

### 2. Backend Firebase Config (Vercel Environment Variables)
The API uses these environment variables that MUST match:

- `FIREBASE_PROJECT_ID` - Must match the `projectId` in index.html
- `FIREBASE_CLIENT_EMAIL` - Service account email (looks like `firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com`)
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `FIREBASE_DATABASE_URL` - Realtime Database URL

## 🔍 How to Find Your Firebase Project ID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** ⚙️ → **Project Settings**
4. The **Project ID** is shown at the top (e.g., `ccx-dashboard` or `your-project-name`)

## 🔍 How to Get Service Account Email

1. Firebase Console → **Project Settings** → **Service Accounts** tab
2. Click **"Generate New Private Key"** (or use existing)
3. The **client_email** in the JSON file is your `FIREBASE_CLIENT_EMAIL`
   - Format: `firebase-adminsdk-xxxxx@PROJECT-ID.iam.gserviceaccount.com`
   - Example: `firebase-adminsdk-abc123@ccx-dashboard.iam.gserviceaccount.com`

## ✅ Checklist

- [ ] `FIREBASE_PROJECT_ID` in Vercel = Project ID in Firebase Console
- [ ] `projectId` in index.html = `FIREBASE_PROJECT_ID` in Vercel
- [ ] `FIREBASE_CLIENT_EMAIL` = Service account email from Firebase JSON
- [ ] `FIREBASE_PRIVATE_KEY` = Private key from Firebase JSON (with `\n` for newlines)
- [ ] `FIREBASE_DATABASE_URL` = Realtime Database URL (format: `https://PROJECT-ID-default-rtdb.firebaseio.com/`)

## 🛠️ Quick Fix

1. **Find your actual Firebase Project ID:**
   - Firebase Console → Project Settings → Copy the Project ID

2. **Update index.html:**
   - Change line 307: `projectId: "YOUR-ACTUAL-PROJECT-ID"`

3. **Set in Vercel Environment Variables:**
   - `FIREBASE_PROJECT_ID` = Your actual project ID
   - `FIREBASE_CLIENT_EMAIL` = From service account JSON
   - `FIREBASE_PRIVATE_KEY` = From service account JSON
   - `FIREBASE_DATABASE_URL` = Your database URL

4. **Redeploy**

## 🧪 Test

After updating, test the API:
- Visit: `https://ccx8.vercel.app/api/portfolio`
- Should return JSON or a clear error message

