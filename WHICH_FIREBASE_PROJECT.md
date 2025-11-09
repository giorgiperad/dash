# Which Firebase Project to Use?

## You Have Two Firebase Projects:

### 1. ccx-tracker
- Service Account: `firebase-adminsdk-fbsvc@ccx-tracker.iam.gserviceaccount.com`
- Project ID: `ccx-tracker`
- File: `ccx-tracker-firebase-adminsdk-fbsvc-9881b1c7b7.json`

### 2. ccx-dashboard  
- Service Account: `firebase-adminsdk-fbsvc@ccx-dashboard.iam.gserviceaccount.com`
- Project ID: `ccx-dashboard`
- File: `ccx-dashboard-firebase-adminsdk-fbsvc-de200f1f4b.json`

## Current Configuration:

**Frontend (index.html):** Currently set to `ccx-tracker`

## Which One Should You Use?

**Check which project has:**
- ✅ Realtime Database enabled
- ✅ Tokens data stored
- ✅ The data you want to display

## Option 1: Use ccx-tracker (Current)

If you want to use `ccx-tracker`:
- ✅ Frontend already configured for `ccx-tracker`
- Set Vercel env vars using `ccx-tracker` JSON file values

## Option 2: Use ccx-dashboard

If you want to use `ccx-dashboard` instead:
- Need to update frontend to use `ccx-dashboard`
- Set Vercel env vars using `ccx-dashboard` JSON file values

## Quick Decision:

**Which project has your tokens/crypto data?**
- Check Firebase Console for both projects
- See which one has data in Realtime Database → `tokens` node
- Use that project!

