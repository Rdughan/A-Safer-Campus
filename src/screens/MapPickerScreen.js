import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function MapPickerScreen({ navigation }) {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoords, setSelectedCoords] = useState(null);

  // ✅ Default fallback (KNUST College of Science)
  const fallbackLocation = {
    latitude: 6.6735,
    longitude: -1.5718,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Using fallback location (KNUST College of Science).");
          setRegion(fallbackLocation);
          setSelectedCoords({
            latitude: fallbackLocation.latitude,
            longitude: fallbackLocation.longitude,
          });
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);
        setSelectedCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log("Error fetching location:", error);
        Alert.alert("Location Error", "Using fallback location (KNUST College of Science).");
        setRegion(fallbackLocation);
        setSelectedCoords({
          latitude: fallbackLocation.latitude,
          longitude: fallbackLocation.longitude,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const confirmLocation = async () => {
    if (!selectedCoords) return;

    try {
      const address = await Location.reverseGeocodeAsync(selectedCoords);
      const addressString =
        address.length > 0
          ? `${address[0].street || ""}, ${address[0].city || ""}, ${address[0].region || ""}`
          : "KNUST College of Science";

      navigation.navigate("ReportIncident", {
        selectedLocation: {
          coords: selectedCoords,
          address: addressString,
        },
      });
    } catch (e) {
      navigation.navigate("ReportIncident", {
        selectedLocation: { coords: selectedCoords, address: "KNUST College of Science" },
      });
    }
  };

  if (loading || !region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          setSelectedCoords({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
          });
        }}
        showsUserLocation
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      {/* Center marker indicator */}
      <View style={styles.markerFixed}>
        <Ionicons name="location-sharp" size={40} color="red" />
      </View>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={confirmLocation}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  markerFixed: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
  },
  backButton: {
    position: "absolute",
    top: 50, // adjust for safe area
    left: 20,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 3, // shadow on Android
    shadowColor: "#000", // shadow on iOS
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  confirmButton: {
    flexDirection: "row",
    backgroundColor: "#239DD6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
});
