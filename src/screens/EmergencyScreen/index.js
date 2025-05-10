// src/screens/EmergencyScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EmergencyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.headerText}>Emergency Resources</Text>
        
        <View style={styles.emergencyCard}>
          <Text style={styles.cardTitle}>Campus Police</Text>
          <Text style={styles.cardText}>Available 24/7 for immediate response to safety concerns</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Call Campus Police</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.emergencyCard}>
          <Text style={styles.cardTitle}>Health Center</Text>
          <Text style={styles.cardText}>Medical assistance for health emergencies</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Contact Health Center</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.emergencyCard}>
          <Text style={styles.cardTitle}>Crisis Counseling</Text>
          <Text style={styles.cardText}>24/7 mental health support for students in distress</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Crisis Helpline</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d32f2f',
  },
  emergencyCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EmergencyScreen;

