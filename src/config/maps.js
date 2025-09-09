// Google Maps API Key - Make sure this key has Maps SDK for Android/iOS enabled
const GOOGLE_MAPS_API_KEY = 'AIzaSyBohvEVz1_67lh0bhThCQ9ulXHDGglH8H8';

export const MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  region: 'GH', // Ghana
  defaultRegion: {
    latitude: 5.6064, // Accra coordinates (fallback)
    longitude: -0.2000,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  // Map styling and features configuration
  mapConfig: {
    showsBuildings: true,
    showsTraffic: false,
    showsIndoors: true,
    showsCompass: true,
    showsScale: true,
    showsMyLocationButton: true,
    mapType: 'standard', // 'standard', 'satellite', 'hybrid', 'terrain'
  }
};

export const GOOGLE_MAPS_API_KEY_EXPORT = GOOGLE_MAPS_API_KEY;

// Function to check Google Maps API status
export const checkGoogleMapsAPIStatus = async () => {
  try {
    console.log("🔍 Checking Google Maps API configuration...");
    
    // Test a simple geocoding request to verify API permissions
    const geocodeTest = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=5.6064,-0.2&key=${GOOGLE_MAPS_API_KEY}`
    );
    const geocodeData = await geocodeTest.json();

    if (geocodeData.status === "OK") {
      console.log("✅ Geocoding API working correctly");
      return true;
    } else if (geocodeData.status === "REQUEST_DENIED") {
      console.error("❌ API Key lacks Geocoding API permissions");
      console.error("💡 Enable Geocoding API in Google Cloud Console");
      return false;
    } else {
      console.warn("⚠️ Geocoding test returned:", geocodeData.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Google Maps API Check Failed:", error);
    return false;
  }
};
