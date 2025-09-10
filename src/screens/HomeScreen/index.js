import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { incidentService } from "../../services/incidentService";
import { MAPS_CONFIG } from "../../config/maps";
import { supabase } from "../../config/supabase";
import LocationDetailModal from "../../components/LocationDetailModal";

const HomeScreen = ({ route }) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [markerCoords, setMarkerCoords] = useState(null);
  const [mapType, setMapType] = useState(route.params?.mapType || "standard");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationIncidents, setLocationIncidents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 5.6064, // Default to Accra coordinates
    longitude: -0.2,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const timeFilterOptions = [
    { key: "all", label: "All Time" },
    { key: "month", label: "This Month" },
    { key: "week", label: "This Week" },
    { key: "today", label: "Today" },
  ];

  // Update mapType when route params change
  useEffect(() => {
    if (route.params?.mapType) {
      setMapType(route.params.mapType);
    }
  }, [route.params?.mapType]);

  useEffect(() => {
    console.log("🔧 [DEBUG] HomeScreen mounted");
    console.log("🔧 [DEBUG] API Key:", MAPS_CONFIG.apiKey);
    console.log("🔧 [DEBUG] Platform:", Platform.OS);
    console.log("🔧 [DEBUG] Map Region:", mapRegion);
    
    // Debug user authentication and role
    (async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("❌ [DEBUG] Auth error:", authError);
        } else if (user) {
          console.log("✅ [DEBUG] User authenticated:", user.id);
          
          // Check user role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, username, student_id')
            .eq('id', user.id)
            .single();
          
          if (userError) {
            console.error("❌ [DEBUG] User data error:", userError);
          } else {
            console.log("✅ [DEBUG] User data:", userData);
          }
        } else {
          console.log("❌ [DEBUG] No user authenticated");
        }
      } catch (error) {
        console.error("❌ [DEBUG] Auth check error:", error);
      }
    })();
    
    (async () => {
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
        timeout: 15000,
      });

      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMarkerCoords(currentCoords);

      // Update map region to center on user location with proper zoom
      const newRegion = {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        latitudeDelta: 0.001, // Much closer zoom for street-level detail
        longitudeDelta: 0.001,
      };

      // Update the map region state
      setMapRegion(newRegion);

      // Update the map region to center on user location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000); // Smooth animation over 1 second
      }

      console.log("Map centered on user location:", currentCoords);
    })();
  }, []);

  // Fetch incidents from Supabase
  const fetchIncidents = async () => {
    try {
      setLoading(true);

      // Use getAllIncidentsForHeatmap to get all incidents for heatmap display
      const { data, error } = await incidentService.getAllIncidentsForHeatmap();

      if (error) {
        console.error("Error fetching incidents:", error);
        // Don't show alert for empty data, just log it
        if (error.message !== "No incidents found") {
          Alert.alert("Error", "Failed to load safety data");
        }
        setIncidents([]);
        return;
      }

      console.log("Fetched incidents:", data?.length || 0, "incidents");

      // Filter incidents with valid coordinates
      const validIncidents = (data || []).filter(
        (incident) => incident.latitude && incident.longitude
      );

      console.log("Valid incidents with coordinates:", validIncidents.length);

      // Apply time filter if specified
      let filteredIncidents = validIncidents;
      if (timeFilter && timeFilter !== "all") {
        const now = new Date();
        const filterDate = new Date();

        switch (timeFilter) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }

        filteredIncidents = validIncidents.filter(
          (incident) => new Date(incident.reported_at) >= filterDate
        );
      }

      console.log("Final filtered incidents:", filteredIncidents.length);
      setIncidents(filteredIncidents);
    } catch (error) {
      console.error("Error in fetchIncidents:", error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [timeFilter]);

  // Refresh incidents when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchIncidents();
    });

    return unsubscribe;
  }, [navigation]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        searchForPlace(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get weight based on incident type severity
  const getIncidentWeight = (incidentType) => {
    const weights = {
      assault: 1.0,
      theft: 0.7,
      harassment: 0.8,
      vandalism: 0.6,
      medical: 0.9,
      fire_attack: 1.0,
      snake_bite: 0.9,
      pickpocketing: 0.7,
      other: 0.5,
    };
    return weights[incidentType] || 0.5;
  };

  // Convert incidents to heatmap points with exact coordinates
  const heatmapPoints = incidents.map((incident) => {
    const point = {
      latitude: parseFloat(incident.latitude), // Ensure exact precision
      longitude: parseFloat(incident.longitude), // Ensure exact precision
      weight: getIncidentWeight(incident.incident_type),
    };
    
    // Debug: Log each heatmap point for verification
    console.log(`🔥 HomeScreen Heatmap Point: ${incident.location_description} -> ${point.latitude}, ${point.longitude} (weight: ${point.weight})`);
    
    return point;
  });

  // Center map on user location
  const centerOnUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
        timeout: 15000,
      });

      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMarkerCoords(currentCoords);

      const newRegion = {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        latitudeDelta: 0.001, // Much closer zoom for street-level detail
        longitudeDelta: 0.001,
      };

      setMapRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      console.log("Map centered on user location:", currentCoords);
    } catch (error) {
      console.error("Error centering on location:", error);
      Alert.alert("Error", "Could not get your current location.");
    }
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  // Enhanced search function using both Places API and Geocoding API
  const searchForPlace = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSelectedSearchResult(null);
      return;
    }

    try {
      setLoading(true);
      let allResults = [];

      // First, try Places API for businesses and points of interest
      try {
        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            query
          )}&key=${MAPS_CONFIG.apiKey}`
        );

        const placesData = await placesResponse.json();

        if (placesData.status === "OK" && placesData.results.length > 0) {
          const placesResults = placesData.results.map((result) => ({
            address: result.formatted_address,
            name: result.name,
            location: {
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            },
            placeId: result.place_id,
            type: "place",
          }));
          allResults = [...allResults, ...placesResults];
        }
      } catch (placesError) {
        console.log("Places API error:", placesError);
      }

      // Then, try Geocoding API for addresses and locations
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            query
          )}&key=${MAPS_CONFIG.apiKey}`
        );

        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
          const geocodeResults = geocodeData.results.map((result) => ({
            address: result.formatted_address,
            name: result.formatted_address,
            location: {
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            },
            placeId: result.place_id,
            type: "address",
          }));
          allResults = [...allResults, ...geocodeResults];
        }
      } catch (geocodeError) {
        console.log("Geocoding API error:", geocodeError);
      }

      // Remove duplicates based on place_id
      const uniqueResults = allResults.filter(
        (result, index, self) =>
          index === self.findIndex((r) => r.placeId === result.placeId)
      );

      if (uniqueResults.length > 0) {
        setSearchResults(uniqueResults.slice(0, 10)); // Limit to 10 results
        setShowSearchResults(true);
      } else {
        // If no results, try with location context (e.g., "hostels in Accra")
        const contextualQuery = `${query} in Ghana`;
        const fallbackResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            contextualQuery
          )}&key=${MAPS_CONFIG.apiKey}`
        );

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.status === "OK" && fallbackData.results.length > 0) {
          const fallbackResults = fallbackData.results.map((result) => ({
            address: result.formatted_address,
            name: result.name,
            location: {
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            },
            placeId: result.place_id,
            type: "place",
          }));

          setSearchResults(fallbackResults.slice(0, 10));
          setShowSearchResults(true);
        } else {
          Alert.alert(
            "No Results",
            `No places found for "${query}". Try searching for specific locations like "hostels in Accra" or "University of Ghana".`
          );
          setSearchResults([]);
          setShowSearchResults(false);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert(
        "Search Error",
        "Could not search for places. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Zoom to selected search result
  const zoomToSearchResult = (result) => {
    console.log("🎯 Zooming to search result:", result);

    // Determine zoom level based on result type and search query
    let latitudeDelta, longitudeDelta;

    // Check if this is a hostel or accommodation search
    const isHostelSearch =
      searchQuery.toLowerCase().includes("hostel") ||
      searchQuery.toLowerCase().includes("accommodation") ||
      result.name?.toLowerCase().includes("hostel") ||
      result.address?.toLowerCase().includes("hostel");

    if (isHostelSearch) {
      // For hostels, zoom in very close
      latitudeDelta = 0.002;
      longitudeDelta = 0.002;
      console.log("🏠 Hostel detected - using close zoom");
    } else if (result.type === "place") {
      // For other businesses, zoom in closer
      latitudeDelta = 0.005;
      longitudeDelta = 0.005;
      console.log("🏢 Business detected - using medium zoom");
    } else {
      // For addresses and general locations, use standard zoom
      latitudeDelta = 0.01;
      longitudeDelta = 0.01;
      console.log("📍 Address detected - using standard zoom");
    }

    const newRegion = {
      latitude: result.location.latitude,
      longitude: result.location.longitude,
      latitudeDelta: latitudeDelta,
      longitudeDelta: longitudeDelta,
    };

    console.log("📍 New region:", newRegion);
    console.log("🗺️ MapRef current:", mapRef.current);
    console.log(
      "🔍 Zoom level - latDelta:",
      latitudeDelta,
      "lngDelta:",
      longitudeDelta
    );

    setMapRegion(newRegion);
    setSearchQuery(result.name || result.address);
    setShowSearchResults(false);
    setSelectedSearchResult(result);

    // Animate to the new location with a small delay to ensure map is ready
    setTimeout(() => {
      if (mapRef.current) {
        console.log("✅ Animating to region...");
        mapRef.current.animateToRegion(newRegion, 1000);
      } else {
        console.log("❌ MapRef is null!");
      }
    }, 100);
  };

  // Group incidents by location
  const groupIncidentsByLocation = (incidents) => {
    const locationGroups = {};
    incidents.forEach((incident) => {
      const key = `${incident.latitude?.toFixed(
        4
      )}_${incident.longitude?.toFixed(4)}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          location: {
            latitude: incident.latitude,
            longitude: incident.longitude,
            location_description: incident.location_description,
          },
          incidents: [],
        };
      }
      locationGroups[key].incidents.push(incident);
    });
    return Object.values(locationGroups);
  };

  // Handle location selection
  const handleLocationPress = (locationData) => {
    setSelectedLocation(locationData.location);
    setLocationIncidents(locationData.incidents);
    setShowLocationModal(true);
  };

  // Handle incident press from modal
  const handleIncidentPress = (incident) => {
    setShowLocationModal(false);
    // Navigate to incident detail screen
    navigation.navigate("IncidentDetail", { incidentId: incident.id });
  };

  // Get location groups for markers
  const locationGroups = groupIncidentsByLocation(incidents);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.logoNameView}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/4413/4413044.png",
            }}
            style={styles.logo}
          />
          <Text style={styles.logoName}>SaferCampus</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search hostels, universities, places..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchForPlace(searchQuery)}
          />
          <TouchableOpacity
            style={styles.searchIconButton}
            onPress={() => searchForPlace(searchQuery)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results Dropdown */}
      {showSearchResults && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <ScrollView
            style={styles.searchResultsList}
            showsVerticalScrollIndicator={false}
          >
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.searchResultItem}
                onPress={() => zoomToSearchResult(result)}
              >
                <Icon
                  name={
                    result.type === "place"
                      ? "business-outline"
                      : "location-outline"
                  }
                  size={20}
                  color="#666"
                />
                <View style={styles.searchResultTextContainer}>
                  {result.name && result.name !== result.address && (
                    <Text style={styles.searchResultName}>{result.name}</Text>
                  )}
                  <Text style={styles.searchResultText}>{result.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        provider={PROVIDER_GOOGLE}
        mapType="standard"
        onPress={() => {
          setShowSearchResults(false);
          setSelectedSearchResult(null);
        }}
        onMapReady={() => {
          console.log("✅ Map is ready!");
          console.log("📍 Map region:", mapRegion);
          console.log("🗺️ Map type: standard");
          console.log("🔑 API Key configured:", !!MAPS_CONFIG.apiKey);
          setMapLoading(false);
        }}
        onMapLoaded={() => {
          console.log("✅ Map loaded successfully!");
          console.log("🌍 Map tiles should now be visible");
          setMapLoading(false);
        }}
        onError={(error) => {
          console.error("❌ Map error:", error);
          setMapError(error.message || "Map failed to load");
          setMapLoading(false);
          Alert.alert(
            "Map Error",
            `Map failed to load. This might be due to:\n\n1. Internet connection issues\n2. Google Maps API key configuration\n3. API quota exceeded\n\nError: ${error.message}`
          );
        }}
      >
        {/* Custom marker for user location */}
        {markerCoords && (
          <Marker
            coordinate={markerCoords}
            title="Your Location"
            description="You are here"
            pinColor="blue"
          />
        )}

        {/* Search result marker */}
        {selectedSearchResult && (
          <Marker
            coordinate={selectedSearchResult.location}
            title={selectedSearchResult.name || "Search Result"}
            description={selectedSearchResult.address}
            pinColor="red"
          />
        )}

        {/* Location-specific incident markers */}
        {locationGroups.map((locationData, index) => (
          <Marker
            key={index}
            coordinate={locationData.location}
            title={`${locationData.incidents.length} incident${
              locationData.incidents.length !== 1 ? "s" : ""
            }`}
            description="Tap for details"
            pinColor={
              locationData.incidents.length > 3
                ? "red"
                : locationData.incidents.length > 1
                ? "orange"
                : "yellow"
            }
            onPress={() => handleLocationPress(locationData)}
          />
        ))}

        {/* Remove the hardcoded Accra marker */}

        {/* Safety Heatmap */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            radius={50}
            opacity={0.3}
            gradient={{
              colors: ["#00ff00", "#ffff00", "#ff0000"],
              startPoints: [0.2, 0.5, 0.8],
              colorMapSize: 2000,
            }}
          />
        )}
      </MapView>

      {/* Loading Overlay */}
      {mapLoading && (
        <View style={styles.mapLoadingOverlay}>
          <Text style={styles.mapLoadingText}>Loading map...</Text>
          <Text style={styles.mapLoadingSubtext}>
            If map doesn't load, check your internet connection
          </Text>
        </View>
      )}

      {/* Error Overlay */}
      {mapError && (
        <View style={styles.mapErrorOverlay}>
          <Icon name="warning" size={24} color="#ff6b6b" />
          <Text style={styles.mapErrorText}>Map Tiles Not Loading</Text>
          <Text style={styles.mapErrorSubtext}>
            Check Google Cloud Console API settings
          </Text>
        </View>
      )}

      {/* Time Filter Buttons */}
      <View style={styles.filterContainer}>
        {timeFilterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              timeFilter === option.key && styles.filterButtonActive,
            ]}
            onPress={() => setTimeFilter(option.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                timeFilter === option.key && styles.filterButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toggle Heatmap Button */}
      <TouchableOpacity
        style={styles.toggleHeatmapButton}
        onPress={toggleHeatmap}
      >
        <Icon name={showHeatmap ? "eye-off" : "eye"} size={24} color="#fff" />
        <Text style={styles.toggleHeatmapButtonText}>
          {showHeatmap ? "Hide" : "Show"} Heatmap
        </Text>
      </TouchableOpacity>

      {/* Center on My Location Button */}
      <TouchableOpacity
        style={styles.centerLocationButton}
        onPress={centerOnUserLocation}
      >
        <Icon name="locate" size={24} color="#fff" />
        <Text style={styles.centerLocationButtonText}>My Location</Text>
      </TouchableOpacity>

      {/* Stats */}
      {showHeatmap && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}{" "}
            reported
          </Text>
          {timeFilter && timeFilter !== "all" && (
            <Text style={styles.statsText}>in the last {timeFilter}</Text>
          )}
        </View>
      )}

      {/* Legend */}
      {showHeatmap && heatmapPoints.length > 0 && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Safety Heatmap</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#00ff00" }]}
              />
              <Text style={styles.legendText}>Low Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#ffff00" }]}
              />
              <Text style={styles.legendText}>Medium Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: "#ff0000" }]}
              />
              <Text style={styles.legendText}>High Risk</Text>
            </View>
          </View>
        </View>
      )}

      {/* Location Detail Modal */}
      <LocationDetailModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        locationData={selectedLocation}
        incidents={locationIncidents}
        onIncidentPress={handleIncidentPress}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    position: "absolute",
    bottom: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  headerContainer: {
    width: "100%",
    height: "auto",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "10%",
    paddingBottom: "6%",
    borderRadius: 20,
    position: "absolute",
    top: 0,
    zIndex: 10,
    gap: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  logo: {
    width: 30,
    height: 30,
  },
  logoName: {
    fontSize: 17,
    color: "black",
    fontFamily: "Montserrat-Bold",
  },
  logoNameView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    width: "100%",
    top: "10%",
  },
  searchBar: {
    zIndex: 1,
    backgroundColor: "#E6E7E8",
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.9,
    width: "80%",
    borderColor: "transparent",
    color: "black",
    overflow: "hidden",
    height: "auto",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    gap: 10,
  },
  searchIconButton: {
    backgroundColor: "#239DD6",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    position: "absolute",
    top: 190,
    left: 20,
    right: 20,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  filterButtonActive: {
    backgroundColor: "#239DD6",
  },
  filterButtonText: {
    fontSize: 11,
    color: "#666",
    fontFamily: "Montserrat-Regular",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  toggleHeatmapButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#239DD6",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleHeatmapButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
  },
  centerLocationButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#239DD6",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerLocationButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
  },
  statsContainer: {
    position: "absolute",
    bottom: 120,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsText: {
    fontSize: 11,
    color: "#333",
    fontFamily: "Montserrat-Regular",
  },
  legend: {
    position: "absolute",
    top: 180,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
    fontFamily: "Montserrat-Bold",
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 10,
    color: "#666",
    fontFamily: "Montserrat-Regular",
  },
  mapLoadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -30 }],
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapLoadingText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#333",
    marginBottom: 5,
  },
  mapLoadingSubtext: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    textAlign: "center",
  },
  mapErrorOverlay: {
    position: "absolute",
    top: 250,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 107, 107, 0.9)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapErrorText: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
    marginTop: 5,
  },
  mapErrorSubtext: {
    fontSize: 11,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 3,
  },
  searchResultsContainer: {
    position: "absolute",
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200,
    // maxWidth: 300,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchResultTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Montserrat-Bold",
    marginBottom: 2,
  },
  searchResultText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Montserrat-Regular",
  },
});
