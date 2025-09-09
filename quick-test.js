// Quick API Key Test
const API_KEY = 'AIzaSyBohvEVz1_67lh0bhThCQ9ulXHDGglH8H8';

console.log('🧪 Testing Google Maps API Key...');
console.log('API Key:', API_KEY);

// Test URLs - Copy these to your browser
console.log('\n📋 Test URLs (copy to browser):');
console.log('1. Static Map:', `https://maps.googleapis.com/maps/api/staticmap?center=5.6064,-0.2000&zoom=15&size=400x400&maptype=hybrid&key=${API_KEY}`);
console.log('2. Geocoding:', `https://maps.googleapis.com/maps/api/geocode/json?latlng=5.6064,-0.2000&key=${API_KEY}`);

console.log('\n🔧 If maps don\'t work, check Google Cloud Console:');
console.log('1. Go to: APIs & Services → Enabled APIs');
console.log('2. Enable: Maps SDK for Android');
console.log('3. Enable: Maps SDK for iOS');
console.log('4. Check: API Key restrictions');
console.log('5. Verify: Billing is enabled');
