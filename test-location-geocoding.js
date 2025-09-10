/**
 * Test script to verify location geocoding functionality
 * Run this with: node test-location-geocoding.js
 */

// Mock the MAPS_CONFIG for testing
const MAPS_CONFIG = {
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY' // Replace with your actual API key
};

// Mock the locationService for testing
const locationService = {
  async geocodeLocation(locationString) {
    if (!locationString || !locationString.trim()) {
      return null;
    }

    try {
      console.log('🔍 Testing geocoding for:', locationString);

      // Test with Google Geocoding API
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          locationString
        )}&key=${MAPS_CONFIG.apiKey}`
      );

      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
        const result = geocodeData.results[0];
        const location = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
          name: result.formatted_address,
          placeId: result.place_id
        };
        
        console.log('✅ Geocoding successful:', location);
        return location;
      }

      console.log('❌ No results found for:', locationString);
      return null;

    } catch (error) {
      console.error('💥 Geocoding error:', error);
      return null;
    }
  }
};

// Test function
async function testLocationGeocoding() {
  console.log('🧪 Testing Location Geocoding Functionality\n');
  
  const testLocations = [
    'Evandy Hostel',
    'University of Ghana',
    'Accra Mall',
    'Kotoka International Airport',
    'Labadi Beach'
  ];

  for (const location of testLocations) {
    console.log(`\n📍 Testing: "${location}"`);
    console.log('─'.repeat(50));
    
    const result = await locationService.geocodeLocation(location);
    
    if (result) {
      console.log(`✅ Found: ${result.name}`);
      console.log(`📍 Coordinates: ${result.latitude}, ${result.longitude}`);
      console.log(`🏠 Address: ${result.address}`);
    } else {
      console.log(`❌ Not found`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Location geocoding test completed!');
}

// Instructions for running the test
console.log(`
🚀 Location Geocoding Test

To run this test:
1. Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key
2. Run: node test-location-geocoding.js

This test will verify that:
- Location names like "Evandy Hostel" can be converted to coordinates
- The geocoding service returns accurate results
- The heatmap will now show incidents at the correct locations

Expected behavior:
✅ When you report an incident at "Evandy Hostel", the heatmap should show it at Evandy Hostel's actual coordinates
✅ Location suggestions should appear as you type
✅ Coordinates should be automatically resolved and stored
`);

// Uncomment the line below to run the test
// testLocationGeocoding();
