import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.IP_ADDRESS || "http://192.168.219.95:5000";

const ReportHistoryScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view your reports.");
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/reports`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch reports");
        }
        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err.message || "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#239DD6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No reports found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.reportItem}
            onPress={() => navigation.navigate('ReportDetail', { report: item })}
          >
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.date}>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</Text>
            <Text style={styles.status}>{item.status || 'No status'}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FB",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#239DD6",
    alignSelf: "center",
  },
  reportItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  type: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    color: "#239DD6",
    marginTop: 4,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F9FB",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});

export default ReportHistoryScreen; 