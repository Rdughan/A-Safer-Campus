import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PRIMARY_BLUE = '#ADD8E6';

const PreferencesScreen = ({ navigation, route }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [receiveAlerts, setReceiveAlerts] = useState(true);
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);
  const [mapType, setMapType] = useState(route.params?.mapType === 'satellite');

   const handleMapTypeChange = (value) => {
    const newMapType = value ? 'satellite' : 'standard';
    setMapType(value);
    navigation.setParams({ mapType: newMapType });
  };

  return (
    <View style={styles.container}>
     
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color="black" style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionName}>APP PREFERENCES</Text>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Enable Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Receive Crime Alerts</Text>
          <Switch
            value={receiveAlerts}
            onValueChange={setReceiveAlerts}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Auto-Detect Location</Text>
          <Switch
            value={autoDetectLocation}
            onValueChange={setAutoDetectLocation}
           
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Map Type: {mapType ? 'Satellite' : 'Standard'}</Text>
          <Switch
            value={mapType}
             onValueChange={handleMapTypeChange}

          />
        </View>

        <Text style={styles.sectionName}>CUSTOMIZATION</Text>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Alert.alert('Feature coming soon')}
        >
          <Text style={styles.linkText}>Change Language</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Alert.alert('Set preferred location')}
        >
          <Text style={styles.linkText}>Set Default Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Alert.alert('Choose how to report crimes')}
        >
          <Text style={styles.linkText}>Crime Reporting Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PreferencesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: PRIMARY_BLUE,
    height: '17%',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  backArrow: {
    marginLeft: 20,
    marginTop: Platform.OS === 'android' ? 50 : 60,
  },
  headerText: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    marginLeft: 20,
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionName: {
    fontFamily: 'Montserrat-Regular',
    marginVertical: 20,
    fontSize: 17,
    color: '#444',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 12,
  },
  label: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
    color: '#333',
    maxWidth: '75%',
  },
  linkButton: {
    paddingVertical: 14,
  },
  linkText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: PRIMARY_BLUE,
  },
});
