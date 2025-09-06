// Google Maps API Key - Make sure this key has Maps SDK for Android/iOS enabled
const GOOGLE_MAPS_API_KEY = 'AIzaSyCX2EchYK-_1u6zTqBFIx8d4BmFObIwntg';

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
