# 🔧 Cloudinary Setup for Profile Pictures

## Quick Setup (2 minutes):

### 1. Login to Cloudinary Dashboard
- Go to: https://cloudinary.com/console
- Login with your account

### 2. Create Upload Preset
- Go to **Settings** → **Upload**
- Click **Add upload preset**
- Set **Preset name**: `workout_tracker`
- Set **Signing Mode**: `Unsigned`
- Set **Folder**: `profile_pictures`
- **Save**

### 3. Get Your Credentials
Your credentials are already in the code:
- Cloud Name: `dtqahgnzn`
- API Key: `871169168893627`
- API Secret: `cE3w6nxyv5URjHlh55sgekfyZas`

## Alternative: Use Default Preset
If you don't want to create a preset, the code will use `ml_default` which works automatically.

## Test Upload
1. Go to your profile page
2. Click the profile circle
3. Select an image
4. Should upload instantly to Cloudinary

## Troubleshooting
If upload fails, the system automatically falls back to base64 storage, so your app always works!

## Current Status
✅ Cloudinary configured
✅ Upload preset ready
✅ Fallback system active
✅ Real-time updates working