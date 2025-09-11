import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';

const LocationPickerModal = ({ visible, onClose, onLocationSelect, initialLocation = null }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.6735, // Default to KNUST
    longitude: -1.5718,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const mapRef = useRef(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to select your current location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
        timeout: 15000,
      });

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(currentLocation);
      setMapRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Set as default selected location
      if (!selectedLocation) {
        setSelectedLocation(currentLocation);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      
      // Fallback to KNUST location
      const fallbackLocation = {
        latitude: 6.6735,
        longitude: -1.5718,
      };
      
      setUserLocation(fallbackLocation);
      setMapRegion({
        ...fallbackLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      if (!selectedLocation) {
        setSelectedLocation(fallbackLocation);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert('No Location Selected', 'Please tap on the map to select a location.');
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSelectedLocation(userLocation);
      setMapRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Search functionality
  const handleSearchInput = (text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (text.trim().length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Debounce search
    const timeout = setTimeout(() => {
      performLocationSearch(text);
    }, 200);
    
    setSearchTimeout(timeout);
  };

  const performLocationSearch = (query) => {
    const commonGhanaLocations = [
      { name: "University of Ghana", address: "Legon, Accra", lat: 5.6502, lng: -0.1869 },
      { name: "KNUST", address: "Kumasi", lat: 6.6720, lng: -1.5713 },
      { name: "University of Cape Coast", address: "Cape Coast", lat: 5.1053, lng: -1.2466 },
      { name: "University for Development Studies", address: "Tamale", lat: 9.4035, lng: -0.8423 },
      { name: "Ashesi University", address: "Berekuso, Accra", lat: 5.7167, lng: -0.3333 },
      { name: "University of Education Winneba", address: "Winneba", lat: 5.3500, lng: -0.6333 },
      { name: "Central University", address: "Accra", lat: 5.6500, lng: -0.2000 },
      { name: "Valley View University", address: "Accra", lat: 5.7000, lng: -0.3000 },
      { name: "Ghana Institute of Management and Public Administration", address: "Accra", lat: 5.6500, lng: -0.2000 },
      { name: "University of Energy and Natural Resources", address: "Sunyani", lat: 7.3500, lng: -2.3333 },
      { name: "University of Health and Allied Sciences", address: "Ho", lat: 6.2000, lng: 0.4667 },
      { name: "University of Mines and Technology", address: "Tarkwa", lat: 5.3000, lng: -2.0000 },
      { name: "Kumasi Technical University", address: "Kumasi", lat: 6.6720, lng: -1.5723 },
      { name: "Takoradi Technical University", address: "Takoradi", lat: 4.9000, lng: -1.7833 },
      { name: "Ho Technical University", address: "Ho", lat: 6.2000, lng: 0.4667 },
      { name: "Koforidua Technical University", address: "Koforidua", lat: 6.1000, lng: -0.2667 },
      { name: "Cape Coast Technical University", address: "Cape Coast", lat: 5.1319, lng: -1.2791 }
    ];
    
    const queryLower = query.toLowerCase();
    const results = commonGhanaLocations
      .filter(location => {
        const nameMatch = location.name.toLowerCase().includes(queryLower);
        const addressMatch = location.address.toLowerCase().includes(queryLower);
        const cityMatch = location.address.split(',')[0].toLowerCase().includes(queryLower);
        return nameMatch || addressMatch || cityMatch;
      })
      .sort((a, b) => {
        // Sort by relevance
        const aNameExact = a.name.toLowerCase() === queryLower;
        const bNameExact = b.name.toLowerCase() === queryLower;
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;
        
        const aNameStarts = a.name.toLowerCase().startsWith(queryLower);
        const bNameStarts = b.name.toLowerCase().startsWith(queryLower);
        if (aNameStarts && !bNameStarts) return -1;
        if (!aNameStarts && bNameStarts) return 1;
        
        return 0;
      })
      .map(location => ({
        id: location.name,
        name: location.name,
        address: location.address,
        location: { latitude: location.lat, longitude: location.lng },
        rating: 0,
        types: ['university']
      }));
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const selectSearchResult = (result) => {
    setSelectedCampus(result);
    setSearchQuery(result.name);
    setShowSearchResults(false);
    
    // Update map region to show the selected location
    const newRegion = {
      latitude: result.location.latitude,
      longitude: result.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    };
    
    setMapRegion(newRegion);
    setSelectedLocation(result.location);
    
    // Dismiss keyboard
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCampus(null);
    setSearchResults([]);
    setShowSearchResults(false);
    
    // Return to user location or default
    if (userLocation) {
      setMapRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
      setSelectedLocation(userLocation);
    }
  };

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Select Location</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={[styles.searchInput, { 
                backgroundColor: isDarkMode ? '#2a2a2a' : '#E6E7E8',
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Search for any campus or location..."
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={searchQuery}
              onChangeText={handleSearchInput}
              returnKeyType="search"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => performLocationSearch(searchQuery)}
              disabled={isSearching}
            >
              <Ionicons name={isSearching ? "hourglass" : "search"} size={20} color="#fff" />
            </TouchableOpacity>
            {(selectedCampus || searchQuery.length > 0) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={[styles.searchResultsContainer, { backgroundColor: theme.background }]}>
            <ScrollView style={styles.searchResultsScroll}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={result.id || index}
                  style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectSearchResult(result)}
                >
                  <View style={styles.searchResultContent}>
                    <Text style={[styles.searchResultTitle, { color: theme.text }]}>
                      {result.name}
                    </Text>
                    <Text style={[styles.searchResultAddress, { color: theme.text + '80' }]}>
                      {result.address}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.text + '60'} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            customMapStyle={isDarkMode ? [
              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            ] : []}
          >
            {/* Selected Location Marker */}
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Selected Location"
                description="Tap to change"
                pinColor="#ff4444"
              />
            )}
          </MapView>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>Getting your location...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            style={[styles.currentLocationButton, { backgroundColor: theme.primary }]}
            disabled={!userLocation}
          >
            <Ionicons name="locate" size={20} color="#fff" />
            <Text style={[styles.currentLocationText, { color: '#fff' }]}>Use Current Location</Text>
          </TouchableOpacity>
          
          <Text style={[styles.instructionText, { color: theme.text }]}>
            Tap anywhere on the map to select the incident location
          </Text>

          <TouchableOpacity 
            onPress={handleConfirm} 
            style={[
              styles.confirmButton, 
              { backgroundColor: selectedLocation ? theme.primary : '#ccc' }
            ]}
            disabled={!selectedLocation}
          >
            <Text style={[styles.confirmButtonText, { color: '#fff' }]}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Add top padding for status bar
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same width as close button to center title
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  controls: {
    padding: 20,
    paddingBottom: 30, // Add extra bottom padding for safe area
    borderTopWidth: 1,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  // Search styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    padding: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 10,
    borderWidth: 0.9,
    borderColor: 'transparent',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontFamily: 'Montserrat-Regular',
  },
  searchIconButton: {
    backgroundColor: '#239DD6',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 140, // Adjust based on header + search height
    left: 20,
    right: 20,
    maxHeight: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchResultsScroll: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  searchResultAddress: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
});

export default LocationPickerModal;
