# Fix New Deployment - Environment Variables Issue

## Problem
The new deployment (`https://ccx8.vercel.app/`) is stuck on "Loading market data..." because Firebase environment variables are not set.

## Solution: Copy Environment Variables from Old Deployment

### Step 1: Check Current Environment Variables

1. Go to **Vercel Dashboard** → Your Project (`ccx8`)
2. Click **Settings** → **Environment Variables**
3. Check if these 4 variables are set:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_DATABASE_URL`

### Step 2: Get Values from Old Working Deployment

Since the old deployment works, you can:

**Option A: Copy from Old Deployment Settings**
1. In Vercel Dashboard, find the old deployment project
2. Go to **Settings** → **Environment Variables**
3. Copy all 4 Firebase environment variables

**Option B: Use the Test Endpoint**
1. Visit: `https://ccx8.vercel.app/api/test` (after deploying the test endpoint)
2. This will show which variables are missing

### Step 3: Set Environment Variables in New Deployment

1. Go to **Vercel Dashboard** → Project `ccx8` → **Settings** → **Environment Variables**
2. Add each variable:

#### FIREBASE_PROJECT_ID
```
ccx-dashboard
```

#### FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@ccx-dashboard.iam.gserviceaccount.com
```

#### FIREBASE_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0xWw1M8EgmycP
59sAI0l5JmGvjhBcyxrO3Uc2aTa6ebOcfPn50XkfJ2BvmJbIsaOHq6ZSUjbFPaB1
/QxNfORMOfcxM8slhaZDWBGtTQKbQ5mqjnyYEKQafFf8zgJPTm4LKzI2CyXbaPFu
dsHj/tjg2Whoh5ofrROccUH7UlCG1+2AqmxwDuWNWAR3wSW3Kco6zJ9LZPLmOx8e
qOGS+c6gdfi/W+PNKaC7M4wQ8+8GCm272p9V18HSmcw+mpTnbYahtzZKenAxxuCM
SFHMlGpCYgpOw2l/qQkPBPIe/peJg+q64Lqp92rF3jSq8H/GPA8ILON0YsxFQ8d7
/2bOIiADAgMBAAECggEAM0zliPGfiKfPPZHQUikxdCqixUXdOeA/wt4EFBpmuCPK
h4nmDPHX3DH6CaF1hQ34eQuK30jKl04GaAWAhMsBJOq8Tl/C8mqLxQfMuHAm4bYc
+UyHakYqtAN+mtVBzYzV6OCA1tpyC2KsRWt5WcEcfi7klOmKoRumeZqgnXh+Ns29
Uk7Z4zFn1rR+lKe7WjWJdmJrj09SEscI0rbslfw5GU6lsDCx87ycG/yoH3L4U1oQ
lhV/PjnX1UbrOdtViCmt785QY5VXD5v3qgna4MFPOSRfEr0By/OLT7iSqphoayaZ
7JswxWeqdINqEC/5ScWgSDLg1jFoTeoQzz1cp+6S0QKBgQDZ/CqhLXlg//duoW4/
PWYU+Ih7VL6NKNVSVOqyo5f32ToObMrZe6CZP+nEmlHIDn8UTjNkJA+71Ao9lN5j
4Y+7oOgLc2jfsxoYSSJgSZmilMF9dVdyzyLH8DkGpsr7zkrJvGkDiTmoG9J8bFtc
3Itji3jUpddyMziG1BarO2FMUwKBgQDUS9zRqrj9FHxL2cZBBswvRNd9ouh5yx6S
6yAbaw8ug1nMWHdeEeFYPmdn5QmfmhkqleSMPLBFmUVWuhtzWrVKF2oAiULmx1Ln
ItexbePF2SR5O7ogCfDu00Wl7b/1WDptuL3hv56UKIJnSzJ//EC3FEwJ5FLJVPED
pa8MAl3nkQKBgQCv7sQBPhB+51guY//07nsbZdPRpn38s/4n6v1ZnIuksCAZUFkP
2qWtylXEJcDntDuAifUUV76TG/n/5czv1DcLejyOMWFtWsIu46fpCr4C6AiaV0Bz
Gxa5Q/rikW+2d7MIyxX+kpyEP6BMZ6/9bMrbVs/44LjYJNr0huyc2toWnQKBgAHt
amTQ6vsJO5Oot38Ro7ruIhK27utkJ7PnxJPbJfkjIiaTywmkmeomLuQnlS3IxV+4
mqmXR3ZqTNHbwLIMacbxbXnxxRS5TIxiqZinycCbFxSusSLnVDOm4WP/Q5Xjpiwm
2Dp7deIceAqeCShWTvQakBIq64F+bu28jFlMkDOxAoGALsRSQZ3YsvbEGM2QF3mV
XkhhlKRPqTmKV36p71XmPtUptO9aoZx0uTPbpJhUUhOUGFuz0QUi8/3T1UeJnj3b
q5PvPy7/D4rMDcKKIad3v5+lVQCCyD0tlmE5PPnVoep5Xd8CFeanLi6/SvuVbfjV
cLjbSTdk0GSElVYBcgui1zQ=
-----END PRIVATE KEY-----
```

**Important:** When pasting the private key in Vercel:
- You can paste it with actual newlines, OR
- You can paste it as one line with `\n` (Vercel will handle it)

#### FIREBASE_DATABASE_URL
```
https://ccx-dashboard-default-rtdb.firebaseio.com/
```

### Step 4: Redeploy

After setting all environment variables:
1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

### Step 5: Test

1. Visit `https://ccx8.vercel.app/api/test` to verify environment variables are set
2. Visit `https://ccx8.vercel.app/` - it should now load!

## Quick Check

After setting variables, test the API directly:
- `https://ccx8.vercel.app/api/test` - Check environment variables
- `https://ccx8.vercel.app/api/portfolio` - Test the main API

If you see errors, check the **Vercel Function Logs**:
1. Go to **Deployments** → Click on the deployment
2. Click **Functions** tab
3. Click on `api/portfolio` to see error logs

