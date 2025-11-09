# Set Environment Variables in Vercel - Quick Guide

## Project Details
- **Project Name**: `ccx8`
- **Project ID**: `prj_8xThnV9EoxETjXIwJYXTRVKhkhI4`
- **Team**: `giorgiperads-projects`

## Step-by-Step Instructions

### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Navigate to project: `ccx8`

2. **Open Environment Variables**
   - Click on **Settings** (gear icon)
   - Click on **Environment Variables** in the left sidebar

3. **Add Each Variable** (Click "Add New" for each):

#### Variable 1: FIREBASE_PROJECT_ID
- **Key**: `FIREBASE_PROJECT_ID`
- **Value**: `ccx-dashboard`
- **Environment**: Select **Production**, **Preview**, and **Development** (all three)
- Click **Save**

#### Variable 2: FIREBASE_CLIENT_EMAIL
- **Key**: `FIREBASE_CLIENT_EMAIL`
- **Value**: `firebase-adminsdk-fbsvc@ccx-dashboard.iam.gserviceaccount.com`
- **Environment**: Select **Production**, **Preview**, and **Development** (all three)
- Click **Save**

#### Variable 3: FIREBASE_PRIVATE_KEY
- **Key**: `FIREBASE_PRIVATE_KEY`
- **Value**: (Copy the entire private key from your JSON file - see below)
- **Environment**: Select **Production**, **Preview**, and **Development** (all three)
- Click **Save**

**Private Key Value** (from your JSON file):
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

**Important Notes for Private Key:**
- You can paste it with actual newlines (each line on a new line)
- OR paste it as one continuous line - Vercel will handle it
- Make sure to include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

#### Variable 4: FIREBASE_DATABASE_URL
- **Key**: `FIREBASE_DATABASE_URL`
- **Value**: `https://ccx-dashboard-default-rtdb.firebaseio.com/`
- **Environment**: Select **Production**, **Preview**, and **Development** (all three)
- Click **Save**

### Step 4: Redeploy

After adding all 4 variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **3 dots** (⋯) menu
4. Click **Redeploy**
5. Wait for deployment to complete

### Step 5: Verify

1. Visit: `https://ccx8.vercel.app/api/test` - Should show all variables are set
2. Visit: `https://ccx8.vercel.app/` - Should now load properly!

---

## Method 2: Using Vercel CLI (If you prefer command line)

If you install Vercel CLI, you can run:

```bash
npm install -g vercel
vercel login
cd your-project-directory
vercel env add FIREBASE_PROJECT_ID production preview development
vercel env add FIREBASE_CLIENT_EMAIL production preview development
vercel env add FIREBASE_PRIVATE_KEY production preview development
vercel env add FIREBASE_DATABASE_URL production preview development
```

But Method 1 (Dashboard) is easier and faster!

---

## Quick Checklist

- [ ] FIREBASE_PROJECT_ID = `ccx-dashboard`
- [ ] FIREBASE_CLIENT_EMAIL = `firebase-adminsdk-fbsvc@ccx-dashboard.iam.gserviceaccount.com`
- [ ] FIREBASE_PRIVATE_KEY = (full key from JSON file)
- [ ] FIREBASE_DATABASE_URL = `https://ccx-dashboard-default-rtdb.firebaseio.com/`
- [ ] All variables set for Production, Preview, and Development
- [ ] Redeployed the project

