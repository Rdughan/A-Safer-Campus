import { StyleSheet, Text, View, Dimensions, Image, TextInput, TouchableOpacity, Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect, useContext } from 'react'
import MapView, { UrlTile, Marker, PROVIDER_GOOGLE, Heatmap } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import CampusAlertModal from '../../components/CampusAlertModal';
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
    const [ghanaCampuses, setGhanaCampuses] = useState([]);

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
            setMapRegion({
                ...newCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            });
            
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
            setMapRegion({
                ...fallbackLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            });
            
            setErrorMsg('Using fallback location (KNUST)');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    

    // Search for campus function
    const searchCampus = () => {
        if (!searchQuery.trim()) {
            setModalData({
                title: 'Search Error',
                message: 'Please enter a campus name to search',
                type: 'error'
            });
            setShowModal(true);
            return;
        }

        // Example Ghana campuses (replace/add as needed)
       
          
        setIsSearching(true);

        // Simulate search delay
        setTimeout(() => {
            const query = searchQuery.toLowerCase().trim();
            const foundCampus = ghanaCampuses.find(campus => 
                campus.name.toLowerCase().includes(query) ||
                campus.address.toLowerCase().includes(query)
            );

            if (foundCampus) {
                setSelectedCampus(foundCampus);
                setCampusMarkers([foundCampus]);
                setHeatmapData(foundCampus.crimeHotspots);

                // Zoom to campus with wider view to show entire campus
                setMapRegion({
                    latitude: foundCampus.location.latitude,
                    longitude: foundCampus.location.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02
                });

                setModalData({
                    title: 'Campus Found!',
                    message: `${foundCampus.name}\n${foundCampus.address}\n\nRed areas indicate crime and danger hotspots.`,
                    type: 'success'
                });
                setShowModal(true);
            } else {
                setModalData({
                    title: 'Campus Not Found',
                    message: 'No campus found with that name. Please try again.',
                    type: 'error'
                });
                setShowModal(true);
            }
            setIsSearching(false);
        }, 1000);
    };

    // Clear search and return to current location
    const clearSearch = () => {
        setSearchQuery('');
        setSelectedCampus(null);
        setCampusMarkers([]);
        setHeatmapData([]);
        if (markerCoords) {
            setMapRegion({
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

    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Update map region when marker coordinates change
    useEffect(() => {
        if (markerCoords) {
            setMapRegion({
                ...markerCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            });
        }
    }, [markerCoords]);

    useEffect(() => {
        const ghanaCampuses = [
          {
            id: 1,
            name: "University of Ghana",
            address: "Legon, Accra",
            location: { latitude: 5.6506, longitude: -0.186964 },
            crimeHotspots: [
              { latitude: 5.651, longitude: -0.187, intensity: 1 },
              { latitude: 5.649, longitude: -0.186, intensity: 0.8 },
            ],
          },
          {
            id: 2,
            name: "Kwame Nkrumah University of Science and Technology (KNUST)",
            address: "Kumasi, Ashanti",
            location: { latitude: 6.672, longitude: -1.5713 },
            crimeHotspots: [
              { latitude: 6.673, longitude: -1.572, intensity: 1 },
              { latitude: 6.671, longitude: -1.570, intensity: 0.9 },
            ],
          },
          {
            id: 3,
            name: "University of Cape Coast",
            address: "Cape Coast, Central Region",
            location: { latitude: 5.1036, longitude: -1.2976 },
            crimeHotspots: [
              { latitude: 5.104, longitude: -1.298, intensity: 0.7 },
              { latitude: 5.102, longitude: -1.296, intensity: 0.6 },
            ],
          },
        {
          id: 4,
            name: "Ashesi University",
            address: "Berekuso, Eastern Region",
            location: { latitude: 5.7603, longitude: -0.2196 },
            crimeHotspots: [
            { latitude: 5.761, longitude: -0.220, intensity: 0.8 },
            { latitude: 5.759, longitude: -0.218, intensity: 0.5 },
            ],
        },
  {
    id: 5,
    name: "University of Energy and Natural Resources (UENR)",
    address: "Sunyani, Bono Region",
    location: { latitude: 7.3380, longitude: -2.3260 },
    crimeHotspots: [
      { latitude: 7.339, longitude: -2.327, intensity: 0.9 },
      { latitude: 7.337, longitude: -2.325, intensity: 0.6 },
    ],
  },
        ];
      
        setGhanaCampuses(ghanaCampuses);
      }, []);

    // Refresh location when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            // Small delay to ensure the screen is fully loaded
            const timer = setTimeout(() => {
                if (!markerCoords) {
                    getCurrentLocation();
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
                            placeholder="Search for a campus in Ghana..."
                            placeholderTextColor={isDarkMode ? '#888' : '#666'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={searchCampus}
                            returnKeyType="search"
                            blurOnSubmit={false}
                        />
                        <TouchableOpacity
                            style={styles.searchIconButton}
                            onPress={searchCampus}
                            disabled={isSearching}
                        >
                            <Icon name={isSearching ? "hourglass" : "search"} size={20} color="#fff" />
                        </TouchableOpacity>
                        {selectedCampus && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearSearch}
                            >
                                <Icon name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={styles.mapTouchable} 
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
                    <View style={styles.colorCodingView}>
                        <View style ={styles.colorView}>
                            <View style ={styles.color}></View>
                             <Text style ={styles.colorText}> Crime</Text>
                        </View>

                        <View style ={styles.colorView}>
                        <View style={[styles.color, { backgroundColor: 'blue' }]} />
                        <Text style ={styles.colorText}> Rape</Text>
                        </View>

                        <View style ={styles.colorView}>
                        <View style={[styles.color, { backgroundColor: 'green' }]} />
                        <Text style ={styles.colorText}>Snake bite</Text>
                        </View>

                        <View style ={styles.colorView}>
                        <View style={[styles.color, { backgroundColor: 'gray' }]} />
                        <Text style ={styles.colorText}>Theft</Text>
                        </View>

                        <View style ={styles.colorView}>
                        <View style={[styles.color, { backgroundColor: 'purple' }]} />
                        <Text style ={styles.colorText}>Pickpocket</Text>
                        </View>

                        <View style ={styles.colorView}>
                        <View style={[styles.color, { backgroundColor: 'orange' }]} />
                        <Text style ={styles.colorText}>Fire</Text>
                        </View>

                        <View style ={styles.colorView}>
                        <View style={[styles.color, { backgroundColor: 'black' }]} />
                        <Text style ={styles.colorText}>Harassment</Text>
                        </View>
                        
                    </View>
                {/* Custom marker for user location */}
                {markerCoords && (
                    <Marker
                        coordinate={markerCoords}
                        title="Your Current Location"
                        description="You are here"
                        pinColor="blue"
                    />
                )}

                {/* Campus markers */}
                {campusMarkers.map((campus) => (
                    <Marker
                        key={campus.id}
                        coordinate={campus.location}
                        title={campus.name}
                        description={campus.address}
                        pinColor="red"
                    />
                ))}

                {/* Crime hotspots heatmap */}
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

            {/* Location refresh button */}
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => {
                    const knustLocation = {
                        latitude: 6.6720, // KNUST College of Science coordinates
                        longitude: -1.5713,
                    };
                    setMarkerCoords(knustLocation);
                    setMapRegion({
                        ...knustLocation,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });
                    setErrorMsg(null); // Clear any previous error messages
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
  mapTouchable: {
    flex: 1,
    width: '100%',
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
  colorCodingView:{
    backgroundColor:'white',
    height:'auto',
    width:120,
    top:'25%',
    position:'absolute',
    right:10,
    padding:12,
    borderRadius:15,
    opacity:0.7

  },
  colorView:{
    flexDirection:'row',
    alignItems:'center',
    gap:5,
  },
  color:{backgroundColor:'red', height:10, width:10, borderRadius:5},
colorText:{    fontFamily:'Montserrat-Regular'},
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
})