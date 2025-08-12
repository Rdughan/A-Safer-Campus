import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, TextInput, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import SafetyHeatmap from '../../components/SafetyHeatmap';
import { useTheme } from '../../hooks/useTheme';

// Ghana Campus Data with coordinates
const GHANA_CAMPUSES = [
    { name: 'Kwame Nkrumah University of Science and Technology (KNUST)', latitude: 6.6720, longitude: -1.5723, city: 'Kumasi' },
    { name: 'University of Ghana (UG)', latitude: 5.6502, longitude: -0.1869, city: 'Accra' },
    { name: 'University of Cape Coast (UCC)', latitude: 5.1319, longitude: -1.2791, city: 'Cape Coast' },
    { name: 'University for Development Studies (UDS)', latitude: 9.4035, longitude: -0.8423, city: 'Tamale' },
    { name: 'University of Education, Winneba (UEW)', latitude: 5.3500, longitude: -0.6333, city: 'Winneba' },
    { name: 'University of Energy and Natural Resources (UENR)', latitude: 7.3500, longitude: -2.3333, city: 'Sunyani' },
    { name: 'University of Health and Allied Sciences (UHAS)', latitude: 6.2000, longitude: 0.4667, city: 'Ho' },
    { name: 'University of Mines and Technology (UMaT)', latitude: 5.3000, longitude: -2.0000, city: 'Tarkwa' },
    { name: 'Ghana Institute of Management and Public Administration (GIMPA)', latitude: 5.6500, longitude: -0.2000, city: 'Accra' },
    { name: 'Ashesi University', latitude: 5.7500, longitude: -0.2000, city: 'Accra' },
    { name: 'Central University', latitude: 5.6500, longitude: -0.2000, city: 'Accra' },
    { name: 'Valley View University', latitude: 5.7000, longitude: -0.3000, city: 'Accra' },
    { name: 'Regent University College', latitude: 5.6500, longitude: -0.2000, city: 'Accra' },
    { name: 'Ghana Technology University College', latitude: 5.6500, longitude: -0.2000, city: 'Accra' },
    { name: 'Accra Institute of Technology', latitude: 5.6500, longitude: -0.2000, city: 'Accra' },
    { name: 'Kumasi Technical University', latitude: 6.6720, longitude: -1.5723, city: 'Kumasi' },
    { name: 'Takoradi Technical University', latitude: 4.9000, longitude: -1.7833, city: 'Takoradi' },
    { name: 'Ho Technical University', latitude: 6.2000, longitude: 0.4667, city: 'Ho' },
    { name: 'Koforidua Technical University', latitude: 6.1000, longitude: -0.2667, city: 'Koforidua' },
    { name: 'Cape Coast Technical University', latitude: 5.1319, longitude: -1.2791, city: 'Cape Coast' },
];

// Default location (KNUST College of Science)
const DEFAULT_LOCATION = {
  latitude: 6.6720,
  longitude: -1.5723,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const SafetyMapScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [timeFilter, setTimeFilter] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const heatmapRef = useRef(null);

  const timeFilterOptions = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'week', label: 'This Week' },
    { key: 'today', label: 'Today' },
  ];

  // Get user's current location
  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        Alert.alert(
          'Location Permission',
          'Location permission is required to show your current location. Using default location (KNUST).',
          [{ text: 'OK' }]
        );
        setUserLocation(DEFAULT_LOCATION);
        setLocationLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 60000,
      });

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      console.log('User location obtained:', currentLocation);
      setUserLocation(currentLocation);
      
      // Update map to show user location
      if (heatmapRef.current) {
        heatmapRef.current.updateRegion(currentLocation);
      }
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Using default location (KNUST).',
        [{ text: 'OK' }]
      );
      setUserLocation(DEFAULT_LOCATION);
    } finally {
      setLocationLoading(false);
    }
  };

  // Center map on user's current location
  const centerOnUserLocation = () => {
    if (userLocation) {
      if (heatmapRef.current) {
        heatmapRef.current.updateRegion(userLocation);
      }
    } else {
      getUserLocation();
    }
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  // Search campuses based on query
  const searchCampuses = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const results = GHANA_CAMPUSES.filter(campus => 
      campus.name.toLowerCase().includes(query.toLowerCase()) ||
      campus.city.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Select a campus and navigate to it
  const selectCampus = (campus) => {
    setSelectedCampus(campus);
    setSearchQuery(campus.name);
    setShowSearchResults(false);
    
    // Update map region to show the selected campus
    if (heatmapRef.current) {
      heatmapRef.current.updateRegion({
        latitude: campus.latitude,
        longitude: campus.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Clear search and reset to user location or default
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCampus(null);
    setSearchResults([]);
    setShowSearchResults(false);
    
    // Reset to user location or default
    const targetLocation = userLocation || DEFAULT_LOCATION;
    if (heatmapRef.current) {
      heatmapRef.current.updateRegion(targetLocation);
    }
  };

  // Get initial location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Trigger a refresh by updating the refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Safety Heatmap</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={centerOnUserLocation}
            disabled={locationLoading}
          >
            <Ionicons 
              name={locationLoading ? "hourglass" : "location"} 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshData}
          >
            <Ionicons name="refresh" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleHeatmap}
          >
            <Ionicons 
              name={showHeatmap ? "eye-off" : "eye"} 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableWithoutFeedback onPress={() => setShowSearchResults(false)}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchBar, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Search for a campus in Ghana..."
            placeholderTextColor={theme.text + '80'}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchCampuses(text);
            }}
            onSubmitEditing={() => searchCampuses(searchQuery)}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchIconButton, { backgroundColor: theme.primary }]}
            onPress={() => searchCampuses(searchQuery)}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
            >
              <Ionicons name="close-circle" size={20} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Search Results Dropdown */}
      {showSearchResults && searchResults.length > 0 && (
        <View style={[styles.searchResultsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {searchResults.map((campus, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
              onPress={() => selectCampus(campus)}
            >
              <Text style={[styles.searchResultText, { color: theme.text }]}>{campus.name}</Text>
              <Text style={[styles.searchResultSubtext, { color: theme.text + '80' }]}>{campus.city}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Time Filter Buttons */}
      <View style={[styles.filterContainer, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        {timeFilterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              { backgroundColor: theme.card },
              timeFilter === option.key && { backgroundColor: theme.primary }
            ]}
            onPress={() => setTimeFilter(option.key)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: theme.text },
              timeFilter === option.key && { color: '#fff' }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location Status */}
      {locationLoading && (
        <View style={[styles.locationStatus, { backgroundColor: theme.card }]}>
          <Ionicons name="location-outline" size={16} color={theme.primary} />
          <Text style={[styles.locationStatusText, { color: theme.text }]}>
            Getting your location...
          </Text>
        </View>
      )}

      {/* Heatmap */}
      <SafetyHeatmap
        ref={heatmapRef}
        key={refreshKey} // Force re-render when refreshKey changes
        style={styles.map}
        showHeatmap={showHeatmap}
        timeFilter={timeFilter}
        selectedCampus={selectedCampus}
        userLocation={userLocation}
        initialRegion={userLocation || DEFAULT_LOCATION}
      />
    </View>
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
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    padding: 8,
    marginRight: 10,
  },
  refreshButton: {
    padding: 8,
    marginRight: 10,
  },
  toggleButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'relative',
  },
  searchBar: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 45,
    paddingRight: 80,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  searchIconButton: {
    position: 'absolute',
    right: 35,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 80,
    padding: 5,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  searchResultText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat-Bold',
  },
  searchResultSubtext: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Montserrat-Regular',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 8,
  },
  locationStatusText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  map: {
    flex: 1,
  },
});

export default SafetyMapScreen;