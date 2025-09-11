import { StyleSheet, Text, View, Dimensions, Image, TextInput, TouchableOpacity, Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect, useContext, useRef } from 'react'
import MapView, { UrlTile, Marker, PROVIDER_GOOGLE, Heatmap } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import CampusAlertModal from '../../components/CampusAlertModal';
import SafetyHeatmap from '../../components/SafetyHeatmap';
import { ThemeContext } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/themes';
import Constants from 'expo-constants';

const HomeScreen = ({ route }) => {
    const { isDarkMode } = useContext(ThemeContext);
    const theme = isDarkMode ? darkTheme : lightTheme;
    
    const [errorMsg, setErrorMsg] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [markerCoords, setMarkerCoords] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [campusMarkers, setCampusMarkers] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ title: '', message: '', type: 'success' });
    const [isMapMoving, setIsMapMoving] = useState(false);
    const [showRealHeatmap, setShowRealHeatmap] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const heatmapRef = useRef(null);

    const getCurrentLocation = async () => {
        try {
            setIsLoadingLocation(true);
            setErrorMsg(null);
            
            // Check if permission is already granted
            let { status } = await Location.getForegroundPermissionsAsync();
            
            // If not granted, request permission
            if (status !== 'granted') {
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                if (newStatus !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    setIsLoadingLocation(false);
                    return;
                }
            }

            // Check if location services are enabled
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (!isEnabled) {
                setErrorMsg('Location services are disabled');
                setIsLoadingLocation(false);
                return;
            }

            // Get current position with timeout and high accuracy
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeout: 15000,
                maximumAge: 60000
            });
            
            const newCoords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            
            setMarkerCoords(newCoords);
            const newRegion = {
                ...newCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            };
            setMapRegion(newRegion);
            
            // Update the heatmap region immediately
            if (heatmapRef.current) {
                heatmapRef.current.updateRegion(newRegion);
            }
            
            // Clear any previous error messages
            setErrorMsg(null);
        } catch (error) {
            console.error('Error getting location:', error);
            
            // Fallback to Mac's location using a default or mock location
            const fallbackLocation = {
                latitude: 6.6720, // KNUST College of Science coordinates
                longitude: -1.5713,
            };
            
            setMarkerCoords(fallbackLocation);
            const fallbackRegion = {
                ...fallbackLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            };
            setMapRegion(fallbackRegion);
            
            // Update the heatmap region immediately
            if (heatmapRef.current) {
                heatmapRef.current.updateRegion(fallbackRegion);
            }
            
            setErrorMsg('Using fallback location (KNUST)');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    // Real-time search function
    const handleSearchInput = (text) => {
        console.log('Search input changed:', text);
        setSearchQuery(text);
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (text.trim().length < 1) {
            console.log('Clearing search results - text too short');
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        
        // Debounce search to avoid too many calls
        const timeout = setTimeout(() => {
            console.log('Starting search for:', text);
            searchLocation(text);
        }, 200);
        
        setSearchTimeout(timeout);
    };

    // Search for any location using local database
    const searchLocation = async (query) => {
        try {
            setIsSearching(true);
            console.log('Searching for:', query);
            
            // Use local database search first
            performLocationSearch(query);
            
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setShowSearchResults(false);
        } finally {
            setIsSearching(false);
        }
    };

    // Alternative search using known locations
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
                // Sort by relevance - exact matches first, then partial matches
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
        
        console.log('Fallback results:', results);
        console.log('Setting search results and showing dropdown');
        setSearchResults(results);
        setShowSearchResults(true);
    };

    // Select a search result
    const selectSearchResult = (result) => {
        setSelectedCampus(result);
        setSearchQuery(result.name);
        setShowSearchResults(false);
        setShowRealHeatmap(false);
        
        // Update map region to show the selected location
        const newRegion = {
            latitude: result.location.latitude,
            longitude: result.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
        };
        
        setMapRegion(newRegion);
        
        if (heatmapRef.current) {
            heatmapRef.current.updateRegion(newRegion);
        }
        
        setModalData({
            title: 'Location Found!',
            message: `${result.name}\n${result.address}\n\nShowing safety data for this area.`,
            type: 'success'
        });
        setShowModal(true);
    };

    // Clear search and return to current location
    const clearSearch = () => {
        setSearchQuery('');
        setSelectedCampus(null);
        setSearchResults([]);
        setShowSearchResults(false);
        setShowRealHeatmap(true); // Switch back to real heatmap
        if (markerCoords) {
            setMapRegion({
                ...markerCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            });
        }
        // Reset real heatmap to user location
        if (heatmapRef.current && markerCoords) {
            heatmapRef.current.updateRegion({
                ...markerCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            });
        }
    };

    // Handle map movement events with platform-specific behavior
    const handleMapDragStart = () => {
        setIsMapMoving(true);
    };

    const handleMapDragEnd = () => {
        setIsMapMoving(false);
        // Dismiss keyboard when map stops moving
        if (Platform.OS === 'ios') {
            Keyboard.dismiss();
        } else {
            // For Android, use a slight delay to ensure smooth interaction
            setTimeout(() => {
                Keyboard.dismiss();
            }, 100);
        }
    };

    const handleMapPress = () => {
        // Dismiss keyboard when map is tapped
        Keyboard.dismiss();
        
        // Reset search if we're in search mode
        if (selectedCampus || showSearchResults) {
            clearSearch();
        }
    };

    // Handle keyboard dismissal for different platforms
    const dismissKeyboard = () => {
        if (Platform.OS === 'ios') {
            Keyboard.dismiss();
        } else {
            // For Android, ensure keyboard is properly dismissed
            Keyboard.dismiss();
        }
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Cleanup search timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Refresh location and incidents when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            // Small delay to ensure the screen is fully loaded
            const timer = setTimeout(() => {
                if (!markerCoords) {
                    getCurrentLocation();
                }
                // Refresh the heatmap to show new incidents
                if (heatmapRef.current) {
                    heatmapRef.current.refresh();
                }
            }, 500);
            
            return () => clearTimeout(timer);
        }, [markerCoords])
    );

    // At the top of your HomeScreen file
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ];
  



    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.logoNameView}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4413/4413044.png' }}
                            style={styles.logo}
                        />
                        <Text style={[styles.logoName, { color: theme.text }]}>SaferCampus</Text>
                    </View>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={[styles.searchBar, { 
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
                            onPress={() => searchLocation(searchQuery)}
                            disabled={isSearching}
                        >
                            <Icon name={isSearching ? "hourglass" : "search"} size={20} color="#fff" />
                        </TouchableOpacity>
                        {(selectedCampus || searchQuery.length > 0) && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearSearch}
                            >
                                <Icon name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                    <View style={[styles.searchResultsContainer, { backgroundColor: theme.background }]}>
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
                                    {result.rating > 0 && (
                                        <View style={styles.searchResultRating}>
                                            <Icon name="star" size={12} color="#FFD700" />
                                            <Text style={[styles.searchResultRatingText, { color: theme.text }]}>
                                                {result.rating.toFixed(1)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Icon name="chevron-forward" size={16} color={theme.text + '60'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.mapContainer}
                    activeOpacity={1}
                    onPress={handleMapPress}
                >
                    {/* Real Safety Heatmap - Always show */}
                    <SafetyHeatmap
                        ref={heatmapRef}
                        style={styles.map}
                        showHeatmap={true}
                        timeFilter="all"
                        userLocation={markerCoords}
                        showMarkers={false}
                        initialRegion={mapRegion || {
                            latitude: 6.673175, 
                            longitude: -1.565423,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01
                        }}
                    />

                    {/* Search Results Overlay - Only show when searching */}
                    {!showRealHeatmap && (
                        <TouchableOpacity 
                            style={styles.searchOverlay} 
                            activeOpacity={1} 
                            onPress={dismissKeyboard}
                        >
                            <MapView
                                style={styles.map}
                                initialRegion={mapRegion || {
                                    latitude: 6.673175, 
                                    longitude: -1.565423,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01
                                }}
                                region={mapRegion}
                                showsUserLocation={true}
                                followsUserLocation={true}
                                provider={PROVIDER_GOOGLE}
                                mapType="standard"
                                customMapStyle={isDarkMode ? darkMapStyle : []} 
                                onPanDrag={handleMapDragStart}
                                onRegionChangeComplete={handleMapDragEnd}
                                onPress={handleMapPress}
                            >
                                {/* No pin markers on home screen - only user location dot and direction */}

                                {/* Crime hotspots heatmap from search */}
                                {heatmapData.length > 0 && (
                                    <Heatmap
                                        points={heatmapData.map(point => ({
                                            latitude: point.latitude,
                                            longitude: point.longitude,
                                            weight: point.intensity
                                        }))}
                                        radius={50}
                                        opacity={0.7}
                                        gradient={{
                                            colors: ['#00ff00', '#ffff00', '#ff0000'],
                                            startPoints: [0.2, 0.5, 0.8],
                                            colorMapSize: 2000
                                        }}
                                    />
                                )}
                            </MapView>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

            {/* Location refresh button */}
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => {
                    // Get current location instead of going to KNUST
                    getCurrentLocation();
                }}
                disabled={isLoadingLocation}
            >
                <Icon 
                    name={isLoadingLocation ? "refresh" : "location"} 
                    size={24} 
                    color="#fff" 
                />
            </TouchableOpacity>
            
                         {/* Error message and retry button */}
             {errorMsg && (
                 <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
                     <Text style={[styles.errorText, { color: theme.text }]}>{errorMsg}</Text>
                     <TouchableOpacity 
                         style={styles.retryButton}
                         onPress={getCurrentLocation}
                         disabled={isLoadingLocation}
                     >
                         <Text style={styles.retryButtonText}>
                             {isLoadingLocation ? 'Getting Location...' : 'Retry Location'}
                         </Text>
                     </TouchableOpacity>
                 </View>
             )}

                           {/* Custom Campus Alert Modal */}
              <CampusAlertModal
                  visible={showModal}
                  onClose={() => setShowModal(false)}
                  title={modalData.title}
                  message={modalData.message}
                  type={modalData.type}
              />
            </View>
        </TouchableWithoutFeedback>
    )
}

export default HomeScreen


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    width: '100%',
  },
  errorText: {
  color: 'red',
  textAlign: 'center',
  marginTop: 10,
  position: 'absolute',
  bottom: 20,
  backgroundColor: 'white',
  padding: 10,
  borderRadius: 5,
},

  map: {
    flex: 1,
    width:'100%',
    
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  mapTouchable: {
    flex: 1,
    width: '100%',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
  },
  headerContainer:{
    width: '100%',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? '12%' : '8%',
    paddingBottom: '6%',
    borderRadius: 20,
    position: 'absolute',
    top: 0, 
    zIndex: 10,
    gap: 20,
    elevation: Platform.OS === 'android' ? 5 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3.84 : 0,
  },
  logo: {
    width: 30,  
    height: 30, 
    
  },
  logoName:{
    fontSize:17,
    fontFamily: 'Montserrat-Bold'
  },
  logoNameView:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:5,
    width:'100%',
    top:'10%',
  },
  searchBar: {
    zIndex: 1,
    padding: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 10,
    borderWidth: 0.9,
    width: '80%',
    borderColor: 'transparent',
    overflow: 'hidden',
    height: 'auto',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontFamily: 'Montserrat-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    gap: 10,
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
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#239DD6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
  },
  refreshButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    right: 20,
    backgroundColor: '#239DD6',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: Platform.OS === 'android' ? 5 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3.84 : 0,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 140,
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
    marginBottom: 4,
  },
  searchResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchResultRatingText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
})