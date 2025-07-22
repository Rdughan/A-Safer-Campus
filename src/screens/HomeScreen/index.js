<<<<<<< HEAD
/**import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import VoiceReport from "../../components/VoiceReport";
import AsyncStorage from "@react-native-async-storage/async-storage";


 
import MapView, { UrlTile, Marker, Heatmap } from "react-native-maps";
import { useEffect } from "react";
import * as Location from "expo-location";

const API_BASE_URL = process.env.IP_ADDRESS || "http://192.168.118.95:5000";


const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [heatmapData, setHeatmapData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

 
  const fetchHeatmap = async () => {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(
      "http://192.168.118.95:5000/api/reports/heatmap",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setHeatmapData(
      data.heatmap
        .filter((h) => h.coords)
        .map((h) => ({
          latitude: h.coords.lat,
          longitude: h.coords.lng,
          weight: Math.max(1, h.score),
        }))
    );
  };
  useEffect(() => {
    fetchHeatmap();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const handleReport = async (report) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to submit a report.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        Alert.alert("Success", "Report submitted successfully");
        fetchHeatmap();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to submit report");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit report");
    }
  };

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
            placeholder="Search for a campus..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                alert(`Searching for ${searchQuery}`);
              }
            }}
          />
          <VoiceReport onReportGenerated={handleReport} />
          <View>
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => alert(`Searching for ${searchQuery}`)}
            >
              <Icon name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 5.6064,
            longitude: -0.2,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomEnabled={true}
          zoomControlEnabled={true}
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
          />

          <Heatmap points={heatmapData} />

          {userLocation && (
            <Marker
              coordinate={userLocation}
              
              title="You are here"
              description="This is you current location"
              pinColor="blue"
            />
          )}
        </MapView>
      </View>
      
    </View>
  );
};
=======
import { StyleSheet, Text, View, Dimensions, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react'
import MapView, { UrlTile, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';

const HomeScreen = ({ route }) => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [markerCoords, setMarkerCoords] = useState(null);
    const [mapType, setMapType] = useState(route.params?.mapType || 'standard');

    // Update mapType when route params change
    useEffect(() => {
        if (route.params?.mapType) {
            setMapType(route.params.mapType);
        }
    }, [route.params?.mapType]);

    useEffect(() => {
        (async () => {
            // Request permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Get current position
            let location = await Location.getCurrentPositionAsync({});
            setMarkerCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.logoNameView}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4413/4413044.png' }}
                        style={styles.logo}
                    />
                    <Text style={styles.logoName}>SaferCampus</Text>
                </View>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search for a campus..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => { }}
                    />
                    <TouchableOpacity
                        style={styles.searchIconButton}
                        onPress={() => alert(`Searching for ${searchQuery}`)}
                    >
                        <Icon name="search" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <MapView
                style={styles.map}
                initialRegion={markerCoords ? {
                    latitude: markerCoords.latitude,
                    longitude: markerCoords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                } : {
                    latitude: 5.6064, // Default location if permission denied
                    longitude: -0.2000,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                }}
                showsUserLocation={true}
                followsUserLocation={true}
                provider={PROVIDER_GOOGLE}
                mapType={mapType} // controls map type
            >
                {/* Custom marker for user location */}
                {markerCoords && (
                    <Marker
                        coordinate={markerCoords}
                        title="Your Location"
                        pinColor="blue"
                    />
                )}

                {mapType === 'standard' && (
                    <UrlTile
                        urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maximumZ={19}
                        tileSize={256}
                    />
                )}

                <Marker
                    coordinate={{ latitude: 5.55, longitude: -0.2 }}
                    title="You are here"
                    description="Welcome to Accra"
                />
            </MapView>
        </View>
    )
}
>>>>>>> origin/main

export default HomeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
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
    width: "100%",
  },
<<<<<<< HEAD
  headerContainer: {
    width: "100%",
    height: "auto",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: "10%",
    borderRadius: 20,
    position: "absolute",
    top: 0,
    zIndex: 10,
    gap: 20,
  },
  logo: {
    width: 30, // Adjust width
    height: 30, // Adjust height
=======
  headerContainer:{
    width:'100%',
    height:'auto',
    backgroundColor:'white',
    alignItems:'center',
    justifyContent:'center',
    paddingTop:'10%',
    paddingBottom:'6%',
    borderRadius:20,
    position:'absolute',
    top: 0, 
    zIndex: 10,
   gap:20,
    elevation:5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
    
  },
  logo: {
    width: 30,  
    height: 30, 
    
>>>>>>> origin/main
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
<<<<<<< HEAD
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    borderWidth: 0.9,
    width: "80%",
    borderColor: "#239DD6",
    color: "black",
    overflow: "hidden",
    height: "auto",
=======
    backgroundColor: '#E6E7E8',
    padding: 10,
    borderRadius: 10,
    borderWidth:0.9,
    width:'80%',
    borderColor:'transparent',
    color:'black',
    overflow: 'hidden',
    height:'auto',
>>>>>>> origin/main
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    gap: 10,
  },
  searchIconButton: {
<<<<<<< HEAD
    backgroundColor: "#239DD6",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})*/

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import VoiceReport from "../../components/VoiceReport";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { UrlTile, Marker, Heatmap, Callout } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const API_BASE_URL = process.env.IP_ADDRESS || "http://192.168.118.95:5000";

const HEATMAP_GRADIENT = {
  colors: [
    "#00FF00", // Green (safe)
    "#FFFF00", // Yellow (moderate)
    "#FFA500", // Orange (elevated)
    "#FF0000", // Red (danger)
  ],
  startPoints: [0.1, 0.3, 0.6, 1],
  colorMapSize: 256,
};

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [heatmapData, setHeatmapData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSummaries, setLocationSummaries] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState("");

  // Register for push notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  // Update user location and push token in backend
  useEffect(() => {
    if (expoPushToken && userLocation) {
      const updateUserLocation = async () => {
        const token = await AsyncStorage.getItem('token');
        await fetch(`${API_BASE_URL}/api/users/update-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            expoPushToken,
            location: { lat: userLocation.latitude, lng: userLocation.longitude }
          })
        });
      };
      updateUserLocation();
    }
  }, [expoPushToken, userLocation]);

  // Fetch heatmap data
  const fetchHeatmap = async () => {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/api/reports/heatmap`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    // Prepare heatmap points
    setHeatmapData(
      data.heatmap
        .filter((h) => h.coords)
        .map((h) => ({
          latitude: h.coords.lat,
          longitude: h.coords.lng,
          weight: Math.max(1, Math.abs(h.score)),
        }))
    );
    // Prepare location summaries for markers
    setLocationSummaries(
      data.heatmap
        .filter((h) => h.coords)
        .map((h) => ({
          location: h.location,
          coords: h.coords,
          count: h.count,
          highestSeverity: h.danger > h.safe ? 'Danger' : 'Safe',
          score: h.score,
        }))
    );
  };
  useEffect(() => {
    fetchHeatmap();
  }, []);

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Handle report submission
  const handleReport = async (report) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to submit a report.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(report),
      });

      if (response.ok) {
        Alert.alert("Success", "Report submitted successfully");
        fetchHeatmap();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to submit report");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit report");
    }
  };

  // Push notification registration helper
  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }
    return token;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.logoNameView}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4413/4413044.png" }}
            style={styles.logo}
          />
          <Text style={styles.logoName}>SaferCampus</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search for a campus..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                alert(`Searching for ${searchQuery}`);
              }
            }}
          />
          <VoiceReport onReportGenerated={handleReport} />
          <View>
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => alert(`Searching for ${searchQuery}`)}
            >
              <Icon name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 5.6064,
          longitude: -0.2,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
        />
        <Heatmap points={heatmapData} gradient={HEATMAP_GRADIENT} />
        {locationSummaries.map((loc, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: loc.coords.lat, longitude: loc.coords.lng }}
            pinColor={loc.highestSeverity === 'Danger' ? 'red' : 'green'}
          >
            <Callout onPress={() => navigation.navigate('LocationDetail', { location: loc })}>
              <View style={{ minWidth: 120 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{loc.location || `Lat: ${loc.coords.lat.toFixed(3)}, Lng: ${loc.coords.lng.toFixed(3)}`}</Text>
                <Text>Incidents: {loc.count}</Text>
                <Text>Score: {loc.score.toFixed(2)}</Text>
                <Text>Level: {loc.highestSeverity}</Text>
                <TouchableOpacity
                  style={{ marginTop: 6, backgroundColor: '#239DD6', borderRadius: 6, padding: 6 }}
                  onPress={() => navigation.navigate('LocationDetail', { location: loc })}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            description="This is your current location"
            pinColor="blue"
          />
        )}
      </MapView>
      {/* Heatmap Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Danger Level</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#00FF00' }]} />
          <Text style={styles.legendLabel}>Safe</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#FFFF00' }]} />
          <Text style={styles.legendLabel}>Moderate</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#FFA500' }]} />
          <Text style={styles.legendLabel}>Elevated</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#FF0000' }]} />
          <Text style={styles.legendLabel}>Danger</Text>
        </View>
      </View>
      {/* Add Report Button */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate('ReportSubmission')}
      >
        <Text style={styles.reportButtonText}>Report an Incident</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
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
    padding: "10%",
    borderRadius: 20,
    position: "absolute",
    top: 0,
    zIndex: 10,
    gap: 20,
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
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    borderWidth: 0.9,
    width: "80%",
    borderColor: "#239DD6",
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
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  legendContainer: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    elevation: 4,
    zIndex: 20,
    minWidth: 110,
  },
  legendTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  legendColor: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  legendLabel: {
    fontSize: 13,
    color: '#333',
  },
  reportButton: {
    backgroundColor: '#239DD6',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
=======
    backgroundColor: '#239DD6',
    padding: 8,
    borderRadius: 10,
>>>>>>> origin/main
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    alignSelf: 'center',
    elevation: 3,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
