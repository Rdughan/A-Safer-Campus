import { MAPS_CONFIG } from '../config/maps';

export const locationService = {
  /**
   * Geocode a location string to get coordinates
   * @param {string} locationString - The location to geocode (e.g., "Evandy Hostel")
   * @returns {Promise<{latitude: number, longitude: number, address: string} | null>}
   */
  async geocodeLocation(locationString) {
    if (!locationString || !locationString.trim()) {
      return null;
    }

    try {
      console.log('🔍 [locationService] Geocoding location:', locationString);

      // First, try Places API for businesses and points of interest
      try {
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            locationString
          )}&key=${MAPS_CONFIG.apiKey}`
        );

        const placesData = await placesResponse.json();

        if (placesData.status === "OK" && placesData.results.length > 0) {
          const result = placesData.results[0]; // Take the first (most relevant) result
          const location = {
            latitude: parseFloat(result.geometry.location.lat), // Ensure exact precision
            longitude: parseFloat(result.geometry.location.lng), // Ensure exact precision
            address: result.formatted_address,
            name: result.name,
            placeId: result.place_id
          };
          
          console.log('✅ [locationService] Found via Places API:', location);
          console.log('📍 [locationService] Exact coordinates:', `${location.latitude}, ${location.longitude}`);
          return location;
        }
      } catch (placesError) {
        console.log('⚠️ [locationService] Places API error:', placesError);
      }

      // Then, try Geocoding API for addresses and locations
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            locationString
          )}&key=${MAPS_CONFIG.apiKey}`
        );

        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
          const result = geocodeData.results[0]; // Take the first result
          const location = {
            latitude: parseFloat(result.geometry.location.lat), // Ensure exact precision
            longitude: parseFloat(result.geometry.location.lng), // Ensure exact precision
            address: result.formatted_address,
            name: result.formatted_address,
            placeId: result.place_id
          };
          
          console.log('✅ [locationService] Found via Geocoding API:', location);
          console.log('📍 [locationService] Exact coordinates:', `${location.latitude}, ${location.longitude}`);
          return location;
        }
      } catch (geocodeError) {
        console.log('⚠️ [locationService] Geocoding API error:', geocodeError);
      }

      // If no results, try with location context (e.g., "hostels in Ghana")
      try {
        const contextualQuery = `${locationString} in Ghana`;
        const fallbackResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            contextualQuery
          )}&key=${MAPS_CONFIG.apiKey}`
        );

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.status === "OK" && fallbackData.results.length > 0) {
          const result = fallbackData.results[0];
          const location = {
            latitude: parseFloat(result.geometry.location.lat), // Ensure exact precision
            longitude: parseFloat(result.geometry.location.lng), // Ensure exact precision
            address: result.formatted_address,
            name: result.name,
            placeId: result.place_id
          };
          
          console.log('✅ [locationService] Found via contextual search:', location);
          console.log('📍 [locationService] Exact coordinates:', `${location.latitude}, ${location.longitude}`);
          return location;
        }
      } catch (fallbackError) {
        console.log('⚠️ [locationService] Fallback search error:', fallbackError);
      }

      console.log('❌ [locationService] No location found for:', locationString);
      return null;

    } catch (error) {
      console.error('💥 [locationService] Unexpected error:', error);
      return null;
    }
  },

  /**
   * Get location suggestions as user types
   * @param {string} query - The search query
   * @returns {Promise<Array>} Array of location suggestions
   */
  async getLocationSuggestions(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      console.log('🔍 [locationService] Getting suggestions for:', query);

      let allResults = [];

      // Try Places API for autocomplete
      try {
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query
          )}&key=${MAPS_CONFIG.apiKey}&types=establishment|geocode`
        );

        const placesData = await placesResponse.json();

        if (placesData.status === "OK" && placesData.predictions.length > 0) {
          const suggestions = placesData.predictions.map((prediction) => ({
            description: prediction.description,
            placeId: prediction.place_id,
            type: 'autocomplete'
          }));
          allResults = [...allResults, ...suggestions];
        }
      } catch (placesError) {
        console.log('⚠️ [locationService] Autocomplete API error:', placesError);
      }

      // Also try text search for more comprehensive results
      try {
        const textSearchResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            query
          )}&key=${MAPS_CONFIG.apiKey}`
        );

        const textSearchData = await textSearchResponse.json();

        if (textSearchData.status === "OK" && textSearchData.results.length > 0) {
          const suggestions = textSearchData.results.slice(0, 5).map((result) => ({
            description: result.name,
            address: result.formatted_address,
            placeId: result.place_id,
            location: {
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            },
            type: 'textsearch'
          }));
          allResults = [...allResults, ...suggestions];
        }
      } catch (textSearchError) {
        console.log('⚠️ [locationService] Text search API error:', textSearchError);
      }

      // Remove duplicates and limit results
      const uniqueResults = allResults.filter(
        (result, index, self) =>
          index === self.findIndex((r) => r.placeId === result.placeId)
      );

      console.log('✅ [locationService] Found suggestions:', uniqueResults.length);
      return uniqueResults.slice(0, 8); // Limit to 8 suggestions

    } catch (error) {
      console.error('💥 [locationService] Error getting suggestions:', error);
      return [];
    }
  },

  /**
   * Get place details by place ID
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object|null>} Place details with coordinates
   */
  async getPlaceDetails(placeId) {
    if (!placeId) {
      return null;
    }

    try {
      console.log('🔍 [locationService] Getting place details for:', placeId);

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name&key=${MAPS_CONFIG.apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const result = data.result;
        const location = {
          latitude: parseFloat(result.geometry.location.lat), // Ensure exact precision
          longitude: parseFloat(result.geometry.location.lng), // Ensure exact precision
          address: result.formatted_address,
          name: result.name,
          placeId: placeId
        };
        
        console.log('✅ [locationService] Place details:', location);
        console.log('📍 [locationService] Exact coordinates:', `${location.latitude}, ${location.longitude}`);
        return location;
      }

      console.log('❌ [locationService] No place details found for:', placeId);
      return null;

    } catch (error) {
      console.error('💥 [locationService] Error getting place details:', error);
      return null;
    }
  }
};
