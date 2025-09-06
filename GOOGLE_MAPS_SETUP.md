# Google Maps API Setup Instructions

## What's Been Done:
✅ Updated `app.json` with Google Maps configuration for iOS and Android
✅ Created `src/config/maps.js` with API key configuration
✅ Updated `SafetyHeatmap.js` to use the API key
✅ Updated `HomeScreen/index.js` to use the API key

## Next Steps:

### 1. Get Your Google Maps API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (optional, for location search)
   - Geocoding API (optional, for address conversion)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

### 2. Update the API Key:
Replace `YOUR_ACTUAL_API_KEY_HERE` in `src/config/maps.js` with your real API key.

### 3. Update app.json:
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `app.json` with your real API key.

### 4. Test the App:
Run `npx expo start` and test the maps functionality.

## Security Note:
- The API key is now directly in your code files
- For production, consider using environment variables
- Make sure to restrict the API key in Google Console to your app's bundle ID

## Bundle IDs Used:
- iOS: `com.safecampus.app`
- Android: `com.safecampus.app`
