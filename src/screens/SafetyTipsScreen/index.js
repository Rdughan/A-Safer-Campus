// src/screens/SafetyTipsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SafetyTipsScreen = () => {
  const safetyTips = [
    {
      id: '1',
      title: 'Walking at Night',
      description: 'Use well-lit paths, travel in groups when possible, and utilize campus escort services after dark.',
    },
    {
      id: '2',
      title: 'Personal Belongings',
      description: 'Keep valuable items secured and never leave personal belongings unattended in public spaces.',
    },
    {
      id: '3',
      title: 'Building Security',
      description: 'Don\'t hold doors open for strangers and ensure residence hall doors close securely behind you.',
    },
    {
      id: '4',
      title: 'Emergency Notification',
      description: 'Sign up for campus emergency alerts and save emergency contacts in your phone.',
    },
    {
      id: '5',
      title: 'Report Suspicious Activity',
      description: 'If you see something concerning, report it to campus security immediately.',
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.tipCard}>
      <Text style={styles.tipTitle}>{item.title}</Text>
      <Text style={styles.tipDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Campus Safety Tips</Text>
      <FlatList
        data={safetyTips}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
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
    color: '#2e7d32',
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e7d32',
  },
  tipDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default SafetyTipsScreen;