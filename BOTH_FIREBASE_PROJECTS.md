# Both Firebase Projects - Choose One

## You Have Two Firebase Projects

### Option 1: ccx-tracker (Currently Configured)
**From:** `ccx-tracker-firebase-adminsdk-fbsvc-9881b1c7b7.json`

**Vercel Environment Variables:**
- `FIREBASE_PROJECT_ID` = `ccx-tracker`
- `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@ccx-tracker.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY` = (from line 5 of ccx-tracker JSON)
- `FIREBASE_DATABASE_URL` = `https://ccx-tracker-default-rtdb.firebaseio.com/`

**Frontend:** Already set to `ccx-tracker` ✅

---

### Option 2: ccx-dashboard
**From:** `ccx-dashboard-firebase-adminsdk-fbsvc-de200f1f4b.json`

**Vercel Environment Variables:**
- `FIREBASE_PROJECT_ID` = `ccx-dashboard`
- `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@ccx-dashboard.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY` = (from line 5 of ccx-dashboard JSON)
- `FIREBASE_DATABASE_URL` = `https://ccx-dashboard-default-rtdb.firebaseio.com/`

**Frontend:** Would need to be updated to `ccx-dashboard`

---

## 🤔 Which One Should You Use?

**Check Firebase Console:**
1. Open both projects in Firebase Console
2. Go to **Realtime Database** in each
3. See which one has:
   - ✅ Tokens data (in `tokens` node)
   - ✅ Your actual crypto data
   - ✅ The data you want to display

**Use the project that has your data!**

---

## 📝 If You Want to Switch to ccx-dashboard

I can update the frontend to use `ccx-dashboard` instead. Just let me know!

**For now, the frontend is set to `ccx-tracker`**, so use the `ccx-tracker` values in Vercel unless you want to switch.

