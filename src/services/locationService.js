// Location service using Expo's built-in Location API (no API keys required)
import * as Location from 'expo-location';

// Cache for location responses to avoid repeated calls
const locationCache = new Map();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Throttled queue to respect reverse geocoding rate limits
const requestQueue = [];
let isProcessingQueue = false;
let lastRequestTime = 0;
const REQUEST_SPACING_MS = 350; // space calls to avoid rate limits
const inFlightByKey = new Map(); // dedupe in-flight requests by cache key
let rateLimitCooldownUntil = 0; // when in cooldown, skip network calls

const enqueueReverseGeocode = (task) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ task, resolve, reject });
    processQueue();
  });
};

const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  try {
    while (requestQueue.length > 0) {
      const now = Date.now();
      if (now < rateLimitCooldownUntil) {
        // Cooldown - resolve queued items with fallback to avoid hammering
        const { task, resolve } = requestQueue.shift();
        try {
          const result = await task(true); // hint to use fallback
          resolve(result);
        } catch (e) {
          resolve(null);
        }
        continue;
      }

      const sinceLast = now - lastRequestTime;
      if (sinceLast < REQUEST_SPACING_MS) {
        await new Promise(r => setTimeout(r, REQUEST_SPACING_MS - sinceLast));
      }

      const { task, resolve, reject } = requestQueue.shift();
      try {
        const result = await task(false);
        lastRequestTime = Date.now();
        resolve(result);
      } catch (err) {
        // If rate limited, enter cooldown briefly
        if (String(err?.message || err).toLowerCase().includes('rate limit')) {
          rateLimitCooldownUntil = Date.now() + 30_000; // 30s cooldown
        }
        reject(err);
      }
    }
  } finally {
    isProcessingQueue = false;
  }
};

// Calculate distance between two coordinates in kilometers
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get location details using Expo's Location.reverseGeocodeAsync
export const getLocationDetails = async (latitude, longitude) => {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return {
      displayName: "Unknown Location",
      name: "Unknown Location",
      address: null,
      coordinates: { lat: latitude, lng: longitude }
    };
  }

  // Round to fewer decimals to increase cache hits (~100m grid)
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  
  // Check cache first
  const cached = locationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data;
  }
  
  // Deduplicate in-flight lookups
  if (inFlightByKey.has(cacheKey)) {
    return inFlightByKey.get(cacheKey);
  }

  const promise = enqueueReverseGeocode(async (forceFallback) => {
    if (forceFallback) {
      return {
        displayName: 'Near this area',
        name: 'Unknown Location',
        address: null,
        coordinates: { lat: latitude, lng: longitude }
      };
    }

    // Request location permissions if not already granted
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
    }

    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: latitude,
        longitude: longitude
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        const locationInfo = {
          displayName: formatDisplayName(location),
          name: extractLocationName(location),
          address: formatFullAddress(location),
          street: location.street,
          city: location.city,
          region: location.region,
          country: location.country,
          postalCode: location.postalCode,
          district: location.district,
          subregion: location.subregion,
          coordinates: { lat: latitude, lng: longitude }
        };

        locationCache.set(cacheKey, { data: locationInfo, timestamp: Date.now() });
        return locationInfo;
      }
    } catch (error) {
      // If rate-limited, set cooldown and return fallback
      if (String(error?.message || error).toLowerCase().includes('rate limit')) {
        rateLimitCooldownUntil = Date.now() + 30_000;
      }
      console.error('Error getting location details:', error);
    }

    return {
      displayName: 'Near this area',
      name: 'Unknown Location',
      address: null,
      coordinates: { lat: latitude, lng: longitude }
    };
  })
    .finally(() => {
      inFlightByKey.delete(cacheKey);
    });

  inFlightByKey.set(cacheKey, promise);
  return promise;
};

// Extract a meaningful location name from the geocoding result
const extractLocationName = (location) => {
  // Priority order for location naming
  if (location.name) return location.name;
  if (location.street && location.streetNumber) {
    return `${location.streetNumber} ${location.street}`;
  }
  if (location.street) return location.street;
  if (location.district) return location.district;
  if (location.subregion) return location.subregion;
  if (location.city) return location.city;
  if (location.region) return location.region;
  return 'Unknown Location';
};

// Format display name with context
const formatDisplayName = (location) => {
  const parts = [];
  
  // Add specific location identifier
  if (location.name) {
    parts.push(location.name);
  } else if (location.street) {
    if (location.streetNumber) {
      parts.push(`${location.streetNumber} ${location.street}`);
    } else {
      parts.push(location.street);
    }
  }
  
  // Add area context
  if (location.district && !parts.some(part => part.includes(location.district))) {
    parts.push(location.district);
  }
  
  // Add city context if not already included
  if (location.city && !parts.some(part => part.includes(location.city))) {
    parts.push(location.city);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
};

// Format full address
const formatFullAddress = (location) => {
  const parts = [];
  
  if (location.streetNumber && location.street) {
    parts.push(`${location.streetNumber} ${location.street}`);
  } else if (location.street) {
    parts.push(location.street);
  }
  
  if (location.district) parts.push(location.district);
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.postalCode) parts.push(location.postalCode);
  if (location.country) parts.push(location.country);
  
  return parts.length > 0 ? parts.join(', ') : null;
};

// Get current user location
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

// Find nearest landmark using current location and reverse geocoding
export const findNearestLandmark = async (latitude, longitude) => {
  const locationDetails = await getLocationDetails(latitude, longitude);
  
  return {
    name: locationDetails.name,
    displayName: locationDetails.displayName,
    address: locationDetails.address,
    distance: 0, // Since this is the exact location
    isExact: true,
    coordinates: { lat: latitude, lng: longitude }
  };
};

// Format location name for display (updated to use real geocoding)
export const formatLocationName = async (latitude, longitude, customLocation = null) => {
  // If custom location is provided and not empty, and it's not a coordinate string, use it
  if (customLocation && customLocation.trim()) {
    // Check if it's a coordinate string
    const isCoordinateString = customLocation.includes('Lat:') || 
                              customLocation.includes('Lng:') || 
                              customLocation.includes('longitude') ||
                              customLocation.includes('latitude') ||
                              /^\d+\.\d+,\s*-?\d+\.\d+$/.test(customLocation.trim()) ||
                              /^Lat:\s*\d+\.\d+,\s*Lng:\s*-?\d+\.\d+$/.test(customLocation.trim()) ||
                              /^\(\d+\.\d+,\s*-?\d+\.\d+\)$/.test(customLocation.trim());
    
    if (!isCoordinateString) {
      // If it's a simple location name, try to enhance it with real location context
      try {
        const locationDetails = await getLocationDetails(latitude, longitude);
        if (locationDetails.city || locationDetails.district) {
          const context = locationDetails.city || locationDetails.district;
          return `${customLocation.trim()} (${context})`;
        }
      } catch (error) {
        console.error('Error getting location context:', error);
      }
      return customLocation.trim();
    }
  }

  // Use real geocoding to get location name
  try {
    const locationDetails = await getLocationDetails(latitude, longitude);
    return locationDetails.displayName;
  } catch (error) {
    console.error('Error formatting location name:', error);
    if (latitude && longitude) {
      return `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } else {
      return "Unknown Location";
    }
  }
};

// Get location context for different display contexts (updated)
export const getLocationContext = async (latitude, longitude, customLocation = null) => {
  try {
    const locationDetails = await getLocationDetails(latitude, longitude);
    
    if (customLocation && customLocation.trim()) {
      return {
        displayName: customLocation.trim(),
        locationDetails: locationDetails,
        isCustom: true
      };
    }

    return {
      displayName: locationDetails.displayName,
      locationDetails: locationDetails,
      isCustom: false
    };
  } catch (error) {
    console.error('Error getting location context:', error);
    return {
      displayName: customLocation || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      locationDetails: null,
      isCustom: !!customLocation
    };
  }
};

// Search for locations by name (using Expo's geocoding)
export const searchLocation = async (locationName) => {
  try {
    const geocodeResult = await Location.geocodeAsync(locationName);
    
    if (geocodeResult && geocodeResult.length > 0) {
      const results = await Promise.all(
        geocodeResult.map(async (result) => {
          const details = await getLocationDetails(result.latitude, result.longitude);
          return {
            ...details,
            coordinates: {
              lat: result.latitude,
              lng: result.longitude
            }
          };
        })
      );
      
      return results;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
};

// Clear location cache (useful for debugging or when you want fresh data)
export const clearLocationCache = () => {
  locationCache.clear();
};

// Get cache statistics (for debugging)
export const getCacheStats = () => {
  return {
    size: locationCache.size,
    entries: Array.from(locationCache.keys())
  };
};

export default {
  getLocationDetails,
  getCurrentLocation,
  findNearestLandmark,
  formatLocationName,
  getLocationContext,
  searchLocation,
  clearLocationCache,
  getCacheStats,
  calculateDistance
};