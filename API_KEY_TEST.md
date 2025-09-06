# Quick API Key Test

## Test Your Current API Key

Your API key: `AIzaSyCX2EchYK-_1u6zTqBFIx8d4BmFObIwntg`

### Test 1: Static Maps API (Satellite Imagery)
Copy and paste this URL into your browser:
```
https://maps.googleapis.com/maps/api/staticmap?center=5.6064,-0.2000&zoom=15&size=400x400&maptype=hybrid&key=AIzaSyCX2EchYK-_1u6zTqBFIx8d4BmFObIwntg
```

**Expected Result**: You should see a satellite image of Accra with street names overlaid.

**If you see an error**: The Static Maps API is not enabled.

### Test 2: Places API (Landmarks)
Copy and paste this URL into your browser:
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=5.6064,-0.2000&radius=1000&key=AIzaSyCX2EchYK-_1u6zTqBFIx8d4BmFObIwntg
```

**Expected Result**: You should see JSON data with nearby places, landmarks, and businesses.

**If you see an error**: The Places API is not enabled.

### Test 3: Geocoding API (Street Names)
Copy and paste this URL into your browser:
```
https://maps.googleapis.com/maps/api/geocode/json?address=Accra,Ghana&key=AIzaSyCX2EchYK-_1u6zTqBFIx8d4BmFObIwntg
```

**Expected Result**: You should see JSON data with Accra's coordinates and address details.

**If you see an error**: The Geocoding API is not enabled.

## What Each Test Tells You

- **Test 1 fails**: You need to enable **Static Maps API**
- **Test 2 fails**: You need to enable **Places API**  
- **Test 3 fails**: You need to enable **Geocoding API**

## If All Tests Pass But App Still Shows Basic Map

1. **Restart your app** completely (close and reopen)
2. **Clear app cache** if possible
3. **Wait 5-10 minutes** for API changes to propagate
4. **Check your internet connection**

## Next Steps Based on Test Results

### If any test fails:
1. Go to Google Cloud Console
2. Enable the missing APIs (see main guide)
3. Wait 5-10 minutes
4. Test again

### If all tests pass but app still shows basic map:
1. Restart your app
2. Check if you're using the correct API key in the app
3. Verify the app has internet permission

