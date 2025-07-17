import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ReportDetailScreen = ({ route }) => {
  const { report } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Details</Text>
      <Text style={styles.label}>Type:</Text>
      <Text style={styles.value}>{report.type}</Text>
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>{report.date}</Text>
      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{report.status}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.value}>{report.description || 'No description provided.'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FB",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#239DD6",
    marginBottom: 24,
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
});

export default ReportDetailScreen; 