# Vercel Environment Variables Checklist

## ✅ Verify All 4 Variables Are Set

Go to: **Vercel Dashboard → Project `ccx8` → Settings → Environment Variables**

Check that you have all 4 variables:

### ✅ 1. FIREBASE_PROJECT_ID
**Should be:**
```
ccx-dashboard
```

### ✅ 2. FIREBASE_CLIENT_EMAIL
**Should be:**
```
firebase-adminsdk-fbsvc@ccx-dashboard.iam.gserviceaccount.com
```

### ✅ 3. FIREBASE_PRIVATE_KEY
**Should be:** (You already set this ✅)
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0xWw1M8EgmycP\n59sAI0l5JmGvjhBcyxrO3Uc2aTa6ebOcfPn50XkfJ2BvmJbIsaOHq6ZSUjbFPaB1\n/QxNfORMOfcxM8slhaZDWBGtTQKbQ5mqjnyYEKQafFf8zgJPTm4LKzI2CyXbaPFu\ndsHj/tjg2Whoh5ofrROccUH7UlCG1+2AqmxwDuWNWAR3wSW3Kco6zJ9LZPLmOx8e\nqOGS+c6gdfi/W+PNKaC7M4wQ8+8GCm272p9V18HSmcw+mpTnbYahtzZKenAxxuCM\nSFHMlGpCYgpOw2l/qQkPBPIe/peJg+q64Lqp92rF3jSq8H/GPA8ILON0YsxFQ8d7\n/2bOIiADAgMBAAECggEAM0zliPGfiKfPPZHQUikxdCqixUXdOeA/wt4EFBpmuCPK\nh4nmDPHX3DH6CaF1hQ34eQuK30jKl04GaAWAhMsBJOq8Tl/C8mqLxQfMuHAm4bYc\n+UyHakYqtAN+mtVBzYzV6OCA1tpyC2KsRWt5WcEcfi7klOmKoRumeZqgnXh+Ns29\nUk7Z4zFn1rR+lKe7WjWJdmJrj09SEscI0rbslfw5GU6lsDCx87ycG/yoH3L4U1oQ\nlhV/PjnX1UbrOdtViCmt785QY5VXD5v3qgna4MFPOSRfEr0By/OLT7iSqphoayaZ\n7JswxWeqdINqEC/5ScWgSDLg1jFoTeoQzz1cp+6S0QKBgQDZ/CqhLXlg//duoW4/\nPWYU+Ih7VL6NKNVSVOqyo5f32ToObMrZe6CZP+nEmlHIDn8UTjNkJA+71Ao9lN5j\n4Y+7oOgLc2jfsxoYSSJgSZmilMF9dVdyzyLH8DkGpsr7zkrJvGkDiTmoG9J8bFtc\n3Itji3jUpddyMziG1BarO2FMUwKBgQDUS9zRqrj9FHxL2cZBBswvRNd9ouh5yx6S\n6yAbaw8ug1nMWHdeEeFYPmdn5QmfmhkqleSMPLBFmUVWuhtzWrVKF2oAiULmx1Ln\nItexbePF2SR5O7ogCfDu00Wl7b/1WDptuL3hv56UKIJnSzJ//EC3FEwJ5FLJVPED\npa8MAl3nkQKBgQCv7sQBPhB+51guY//07nsbZdPRpn38s/4n6v1ZnIuksCAZUFkP\n2qWtylXEJcDntDuAifUUV76TG/n/5czv1DcLejyOMWFtWsIu46fpCr4C6AiaV0Bz\nGxa5Q/rikW+2d7MIyxX+kpyEP6BMZ6/9bMrbVs/44LjYJNr0huyc2toWnQKBgAHt\namTQ6vsJO5Oot38Ro7ruIhK27utkJ7PnxJPbJfkjIiaTywmkmeomLuQnlS3IxV+4\nmqmXR3ZqTNHbwLIMacbxbXnxxRS5TIxiqZinycCbFxSusSLnVDOm4WP/Q5Xjpiwm\n2Dp7deIceAqeCShWTvQakBIq64F+bu28jFlMkDOxAoGALsRSQZ3YsvbEGM2QF3mV\nXkhhlKRPqTmKV36p71XmPtUptO9aoZx0uTPbpJhUUhOUGFuz0QUi8/3T1UeJnj3b\nq5PvPy7/D4rMDcKKIad3v5+lVQCCyD0tlmE5PPnVoep5Xd8CFeanLi6/SvuVbfjV\ncLjbSTdk0GSElVYBcgui1zQ=\n-----END PRIVATE KEY-----\n
```

### ⚠️ 4. FIREBASE_DATABASE_URL
**Need to set this!** Get from Firebase Console:
1. Go to Firebase Console → `ccx-dashboard` project
2. Click **Realtime Database**
3. Copy the URL (usually: `https://ccx-dashboard-default-rtdb.firebaseio.com/`)

## 📝 Next Steps

1. **Set FIREBASE_DATABASE_URL** (if not already set)
2. **Make sure all 4 variables are set** for Production, Preview, and Development
3. **Redeploy** your project
4. **Test:** Visit `https://ccx8.vercel.app/api/portfolio`

## ✅ After Redeploying

The site should work! If you still see "Loading market data...", check:
- Vercel Function Logs for errors
- Browser Console (F12) for errors
- API endpoint directly: `https://ccx8.vercel.app/api/portfolio`

