# Google Maps API Setup Guide for Detailed Satellite Imagery

## Current Issue
The map is showing basic view without satellite imagery, street names, or landmarks. This happens when the Google Maps API key doesn't have all necessary services enabled.

## Required Google Cloud Services

### 1. **Maps SDK for Android** ✅ (Likely enabled)
- Required for basic map functionality

### 2. **Maps SDK for iOS** ✅ (Likely enabled)  
- Required for basic map functionality

### 3. **Places API** 🔴 (Likely missing)
- **Required for**: Landmarks, hostels, businesses, points of interest
- **What it shows**: Business names, landmarks, hostels, restaurants, etc.

### 4. **Geocoding API** 🔴 (Likely missing)
- **Required for**: Street names, address details
- **What it shows**: Street names, address information

### 5. **Static Maps API** 🔴 (Likely missing)
- **Required for**: Satellite imagery tiles
- **What it shows**: Satellite images, terrain details

## Step-by-Step Setup Instructions

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create one)
3. Make sure billing is enabled (required for these APIs)

### Step 2: Enable Required APIs
1. Go to **APIs & Services** > **Library**
2. Search and enable these APIs:
   - **Places API**
   - **Geocoding API** 
   - **Static Maps API**
   - **Maps JavaScript API** (if not already enabled)

### Step 3: Set API Key Restrictions (Optional but Recommended)
1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **Application restrictions**, set to:
   - **Android apps**: Add your package name `com.safecampus.app`
   - **iOS apps**: Add your bundle ID `com.safecampus.app`
4. Under **API restrictions**, select:
   - **Restrict key**
   - Select all the APIs you enabled above

### Step 4: Verify API Key
Your current API key: `AIzaSyBohvEVz1_67lh0bhThCQ9ulXHDGglH8H8`

## Testing the Setup

### Option 1: Test in Browser
1. Open this URL in browser (replace YOUR_API_KEY):
```
https://maps.googleapis.com/maps/api/staticmap?center=5.6064,-0.2000&zoom=15&size=400x400&maptype=hybrid&key=YOUR_API_KEY
```

### Option 2: Test Places API
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=5.6064,-0.2000&radius=1000&key=YOUR_API_KEY
```

## Expected Results After Setup

### Before (Current):
- Basic map with faint lines
- No satellite imagery
- No street names
- No landmarks or businesses

### After (With all APIs enabled):
- **Satellite imagery**: Real satellite photos
- **Street names**: All street names clearly visible
- **Landmarks**: Hostels, businesses, points of interest
- **Building outlines**: 3D building shapes
- **Traffic information**: Real-time traffic data

## Troubleshooting

### If still not working:
1. **Check billing**: Ensure billing is enabled on your Google Cloud project
2. **Wait 5-10 minutes**: API changes can take time to propagate
3. **Check API quotas**: Ensure you haven't exceeded free tier limits
4. **Verify API key**: Make sure the key in your app matches the one in Google Cloud Console

### Common Error Messages:
- **"This API project is not authorized"**: Enable the required APIs
- **"Billing not enabled"**: Enable billing in Google Cloud Console
- **"Quota exceeded"**: Check your usage limits

## Cost Information
- **Places API**: $17 per 1000 requests
- **Geocoding API**: $5 per 1000 requests  
- **Static Maps API**: $2 per 1000 requests
- **Free tier**: Usually 2000-2500 requests per month

## Next Steps
1. Enable all required APIs in Google Cloud Console
2. Wait 5-10 minutes for changes to take effect
3. Restart your app
4. You should now see detailed satellite imagery with landmarks!

## Support
If issues persist after following this guide:
1. Check Google Cloud Console for any error messages
2. Verify all APIs are enabled and billing is active
3. Test the API key using the browser URLs above
