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
import React, { useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import VoiceReport from "../../components/VoiceReport";
import AsyncStorage from "@react-native-async-storage/async-storage";


/*import { useAuth } from '../../context/AuthContext';*/
import MapView, { UrlTile, Marker, Heatmap } from "react-native-maps";
import { useEffect } from "react";
import * as Location from "expo-location";

const API_BASE_URL = process.env.IP_ADDRESS || "http://192.168.118.95:5000";


const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [heatmapData, setHeatmapData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  /*useEffect(() => {*/
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
              /*coordinate={{ latitude: 5.55, longitude: -0.2 }}*/
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
    width: 30, // Adjust width
    height: 30, // Adjust height
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
});
