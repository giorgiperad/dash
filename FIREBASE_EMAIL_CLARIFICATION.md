# Firebase Email Clarification

## ⚠️ Important: Two Different Emails

### 1. Your User Email (for login)
- **Email:** `vasokima@gmail.com`
- **Used for:** User authentication/login in the app
- **Not used for:** Backend API (Admin SDK)

### 2. Service Account Email (for API/Backend)
- **Format:** `firebase-adminsdk-xxxxx@PROJECT-ID.iam.gserviceaccount.com`
- **Used for:** Backend API (`/api/portfolio`) to access Firebase Database
- **This is what goes in:** `FIREBASE_CLIENT_EMAIL` environment variable

## 🔍 How to Get Your Service Account Email

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** ⚙️ → **Project Settings**

### Step 2: Get Service Account
1. Go to **"Service Accounts"** tab
2. You'll see a section titled **"Firebase Admin SDK"**
3. Click **"Generate New Private Key"** button
4. A JSON file will download

### Step 3: Extract from JSON
Open the downloaded JSON file. It looks like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Copy these values:**
- `project_id` → `FIREBASE_PROJECT_ID` in Vercel
- `client_email` → `FIREBASE_CLIENT_EMAIL` in Vercel (THIS is the service account email!)
- `private_key` → `FIREBASE_PRIVATE_KEY` in Vercel

### Step 4: Get Database URL
1. In Firebase Console, go to **Realtime Database**
2. Copy the URL (format: `https://PROJECT-ID-default-rtdb.firebaseio.com/`)
3. This goes in `FIREBASE_DATABASE_URL` in Vercel

## ✅ Summary

- **Your login email:** `vasokima@gmail.com` (for user authentication - already working)
- **Service account email:** `firebase-adminsdk-xxxxx@PROJECT-ID.iam.gserviceaccount.com` (for API - needs to be set in Vercel)

The API needs the **service account email**, not your user email!

