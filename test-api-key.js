// Quick test to verify Google Maps API key is working
const API_KEY = 'AIzaSyBohvEVz1_67lh0bhThCQ9ulXHDGglH8H8';

// Test URLs to verify API key functionality
console.log('Testing Google Maps API Key...');
console.log('API Key:', API_KEY);

// Test 1: Static Maps API
const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=5.6064,-0.2000&zoom=15&size=400x400&maptype=hybrid&key=${API_KEY}`;
console.log('\n1. Static Maps Test URL:');
console.log(staticMapUrl);

// Test 2: Geocoding API
const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Accra,Ghana&key=${API_KEY}`;
console.log('\n2. Geocoding Test URL:');
console.log(geocodingUrl);

// Test 3: Places API
const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=5.6064,-0.2000&radius=1000&key=${API_KEY}`;
console.log('\n3. Places Test URL:');
console.log(placesUrl);

console.log('\nCopy these URLs to your browser to test if the API key works.');
console.log('If you see maps/images, the API key is working correctly.');

