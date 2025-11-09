# Vercel Environment Variables - Final Setup (ccx-dashboard)

## ✅ Use These Exact Values in Vercel

Go to: **Vercel Dashboard → Project `ccx8` → Settings → Environment Variables**

### 1. FIREBASE_PROJECT_ID
**Value:**
```
ccx-dashboard
```

### 2. FIREBASE_CLIENT_EMAIL
**Value:**
```
firebase-adminsdk-fbsvc@ccx-dashboard.iam.gserviceaccount.com
```

### 3. FIREBASE_PRIVATE_KEY
**Value:** (Copy the entire key from line 5 - it already has `\n` for newlines)
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0xWw1M8EgmycP\n59sAI0l5JmGvjhBcyxrO3Uc2aTa6ebOcfPn50XkfJ2BvmJbIsaOHq6ZSUjbFPaB1\n/QxNfORMOfcxM8slhaZDWBGtTQKbQ5mqjnyYEKQafFf8zgJPTm4LKzI2CyXbaPFu\ndsHj/tjg2Whoh5ofrROccUH7UlCG1+2AqmxwDuWNWAR3wSW3Kco6zJ9LZPLmOx8e\nqOGS+c6gdfi/W+PNKaC7M4wQ8+8GCm272p9V18HSmcw+mpTnbYahtzZKenAxxuCM\nSFHMlGpCYgpOw2l/qQkPBPIe/peJg+q64Lqp92rF3jSq8H/GPA8ILON0YsxFQ8d7\n/2bOIiADAgMBAAECggEAM0zliPGfiKfPPZHQUikxdCqixUXdOeA/wt4EFBpmuCPK\nh4nmDPHX3DH6CaF1hQ34eQuK30jKl04GaAWAhMsBJOq8Tl/C8mqLxQfMuHAm4bYc\n+UyHakYqtAN+mtVBzYzV6OCA1tpyC2KsRWt5WcEcfi7klOmKoRumeZqgnXh+Ns29\nUk7Z4zFn1rR+lKe7WjWJdmJrj09SEscI0rbslfw5GU6lsDCx87ycG/yoH3L4U1oQ\nlhV/PjnX1UbrOdtViCmt785QY5VXD5v3qgna4MFPOSRfEr0By/OLT7iSqphoayaZ\n7JswxWeqdINqEC/5ScWgSDLg1jFoTeoQzz1cp+6S0QKBgQDZ/CqhLXlg//duoW4/\nPWYU+Ih7VL6NKNVSVOqyo5f32ToObMrZe6CZP+nEmlHIDn8UTjNkJA+71Ao9lN5j\n4Y+7oOgLc2jfsxoYSSJgSZmilMF9dVdyzyLH8DkGpsr7zkrJvGkDiTmoG9J8bFtc\n3Itji3jUpddyMziG1BarO2FMUwKBgQDUS9zRqrj9FHxL2cZBBswvRNd9ouh5yx6S\n6yAbaw8ug1nMWHdeEeFYPmdn5QmfmhkqleSMPLBFmUVWuhtzWrVKF2oAiULmx1Ln\nItexbePF2SR5O7ogCfDu00Wl7b/1WDptuL3hv56UKIJnSzJ//EC3FEwJ5FLJVPED\npa8MAl3nkQKBgQCv7sQBPhB+51guY//07nsbZdPRpn38s/4n6v1ZnIuksCAZUFkP\n2qWtylXEJcDntDuAifUUV76TG/n/5czv1DcLejyOMWFtWsIu46fpCr4C6AiaV0Bz\nGxa5Q/rikW+2d7MIyxX+kpyEP6BMZ6/9bMrbVs/44LjYJNr0huyc2toWnQKBgAHt\namTQ6vsJO5Oot38Ro7ruIhK27utkJ7PnxJPbJfkjIiaTywmkmeomLuQnlS3IxV+4\nmqmXR3ZqTNHbwLIMacbxbXnxxRS5TIxiqZinycCbFxSusSLnVDOm4WP/Q5Xjpiwm\n2Dp7deIceAqeCShWTvQakBIq64F+bu28jFlMkDOxAoGALsRSQZ3YsvbEGM2QF3mV\nXkhhlKRPqTmKV36p71XmPtUptO9aoZx0uTPbpJhUUhOUGFuz0QUi8/3T1UeJnj3b\nq5PvPy7/D4rMDcKKIad3v5+lVQCCyD0tlmE5PPnVoep5Xd8CFeanLi6/SvuVbfjV\ncLjbSTdk0GSElVYBcgui1zQ=\n-----END PRIVATE KEY-----\n
```

### 4. FIREBASE_DATABASE_URL
**Value:** (Get from Firebase Console → Realtime Database)
```
https://ccx-dashboard-default-rtdb.firebaseio.com/
```
*(If your database URL is different, use the actual URL from Firebase Console)*

## 📝 Steps to Set in Vercel:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select project: `ccx8`

2. **Navigate to Environment Variables:**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add Each Variable:**
   - Click **"Add New"**
   - **Key:** Variable name (e.g., `FIREBASE_PROJECT_ID`)
   - **Value:** Paste value from above
   - **Environments:** Select all (Production, Preview, Development)
   - Click **"Save"**
   - Repeat for all 4 variables

4. **Important Notes:**
   - ✅ Frontend updated to use `ccx-dashboard`
   - ✅ Private key already has `\n` - copy exactly as shown
   - ✅ Get Database URL from Firebase Console if different

5. **Redeploy:**
   - After setting all variables, go to **Deployments** tab
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit

## ✅ Verification

After redeploying:
- Test API: `https://ccx8.vercel.app/api/portfolio`
- Should return JSON with crypto data
- Site should load properly!

