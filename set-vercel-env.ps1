# PowerShell Script to Set Vercel Environment Variables
# This script helps you set Firebase environment variables in Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vercel Environment Variables Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read Firebase credentials
$firebaseFile = "$env:USERPROFILE\Desktop\ccx-dashboard-firebase-adminsdk-fbsvc-de200f1f4b.json"
if (Test-Path $firebaseFile) {
    Write-Host "Reading Firebase credentials..." -ForegroundColor Green
    $firebase = Get-Content $firebaseFile | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "Environment Variables to Set:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. FIREBASE_PROJECT_ID" -ForegroundColor Cyan
    Write-Host "   Value: $($firebase.project_id)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "2. FIREBASE_CLIENT_EMAIL" -ForegroundColor Cyan
    Write-Host "   Value: $($firebase.client_email)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. FIREBASE_PRIVATE_KEY" -ForegroundColor Cyan
    Write-Host "   Value: (Full private key - see below)" -ForegroundColor White
    Write-Host "   $($firebase.private_key)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. FIREBASE_DATABASE_URL" -ForegroundColor Cyan
    $dbUrl = if ($firebase.databaseURL) { $firebase.databaseURL } else { "https://ccx-dashboard-default-rtdb.firebaseio.com/" }
    Write-Host "   Value: $dbUrl" -ForegroundColor White
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://vercel.com/giorgiperads-projects/ccx8/settings/environment-variables" -ForegroundColor White
    Write-Host "2. Log in to Vercel" -ForegroundColor White
    Write-Host "3. Click 'Add New' for each variable above" -ForegroundColor White
    Write-Host "4. Copy and paste the values shown above" -ForegroundColor White
    Write-Host "5. Select all environments (Production, Preview, Development)" -ForegroundColor White
    Write-Host "6. Click 'Save' for each" -ForegroundColor White
    Write-Host "7. Redeploy your project" -ForegroundColor White
    Write-Host ""
    
    # Copy values to clipboard helper
    Write-Host "Would you like to copy values to clipboard? (Y/N)" -ForegroundColor Yellow
    $copy = Read-Host
    if ($copy -eq "Y" -or $copy -eq "y") {
        $clipboard = @"
FIREBASE_PROJECT_ID=$($firebase.project_id)
FIREBASE_CLIENT_EMAIL=$($firebase.client_email)
FIREBASE_PRIVATE_KEY=$($firebase.private_key)
FIREBASE_DATABASE_URL=$dbUrl
"@
        Set-Clipboard -Value $clipboard
        Write-Host "Values copied to clipboard!" -ForegroundColor Green
    }
    
} else {
    Write-Host "Firebase credentials file not found at: $firebaseFile" -ForegroundColor Red
    Write-Host "Please ensure the file exists." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to open Vercel in your browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://vercel.com/giorgiperads-projects/ccx8/settings/environment-variables"

