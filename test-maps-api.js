// Test Google Maps API Key
const API_KEY = 'AIzaSyBohvEVz1_67lh0bhThCQ9ulXHDGglH8H8';

console.log('🧪 Testing Google Maps API Key...');
console.log('API Key:', API_KEY);

// Test 1: Static Maps API
const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=5.6064,-0.2000&zoom=15&size=400x400&maptype=hybrid&key=${API_KEY}`;
console.log('\n1. Static Maps Test URL:');
console.log(staticMapUrl);

// Test 2: Geocoding API
const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=5.6064,-0.2000&key=${API_KEY}`;
console.log('\n2. Geocoding Test URL:');
console.log(geocodingUrl);

// Test 3: Places API
const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=5.6064,-0.2000&radius=1000&key=${API_KEY}`;
console.log('\n3. Places Test URL:');
console.log(placesUrl);

console.log('\n📋 Instructions:');
console.log('1. Copy each URL above and paste into your browser');
console.log('2. If you see a map image or JSON data, the API key works');
console.log('3. If you see an error, check Google Cloud Console API settings');
console.log('\n🔧 Required APIs in Google Cloud Console:');
console.log('- Maps SDK for Android');
console.log('- Maps SDK for iOS');
console.log('- Maps Static API');
console.log('- Places API');
console.log('- Geocoding API');

