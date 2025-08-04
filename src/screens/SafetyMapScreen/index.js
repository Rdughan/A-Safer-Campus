import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import SafetyHeatmap from '../../components/SafetyHeatmap';

const SafetyMapScreen = ({ navigation }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const heatmapRef = useRef(null);

  const timeFilterOptions = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'week', label: 'This Week' },
    { key: 'today', label: 'Today' },
  ];

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Heatmap</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshData}
          >
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleHeatmap}
          >
            <Ionicons 
              name={showHeatmap ? "eye-off" : "eye"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Filter Buttons */}
      <View style={styles.filterContainer}>
        {timeFilterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              timeFilter === option.key && styles.filterButtonActive
            ]}
            onPress={() => setTimeFilter(option.key)}
          >
            <Text style={[
              styles.filterButtonText,
              timeFilter === option.key && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Heatmap */}
      <SafetyHeatmap
        ref={heatmapRef}
        key={refreshKey} // Force re-render when refreshKey changes
        style={styles.map}
        showHeatmap={showHeatmap}
        timeFilter={timeFilter}
        initialRegion={{
          latitude: 5.6064, // Your campus coordinates
          longitude: -0.2000,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 10,
  },
  toggleButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#239DD6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
});

export default SafetyMapScreen;