import React, { useState, useContext } from 'react';
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
import { ThemeContext } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/themes';

const PRIMARY_BLUE = '#ADD8E6';

const PreferencesScreen = ({ navigation, route }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [receiveAlerts, setReceiveAlerts] = useState(true);
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);
  const [mapType, setMapType] = useState(route.params?.mapType === 'satellite');

  const theme = isDarkMode ? darkTheme : lightTheme;

   const handleMapTypeChange = (value) => {
    const newMapType = value ? 'satellite' : 'standard';
    setMapType(value);
    navigation.setParams({ mapType: newMapType });
  };

  const handleDarkModeToggle = (value) => {
    toggleTheme(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
     
      <View style={[styles.headerContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : PRIMARY_BLUE }]}>
        <View style={{flexDirection:'row', alignItems:'center' , gap:20, position:'absolute', bottom:'20%'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={25} color={theme.text} style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>Preferences</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionName, { color: theme.text }]}>APP PREFERENCES</Text>

        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons 
              name={isDarkMode ? "moon" : "sunny"} 
              size={20} 
              color={theme.text} 
              style={styles.settingIcon}
            />
            <Text style={[styles.label, { color: theme.text }]}>Enable Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Receive Crime Alerts</Text>
          <Switch
            value={receiveAlerts}
            onValueChange={setReceiveAlerts}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Auto-Detect Location</Text>
          <Switch
            value={autoDetectLocation}
            onValueChange={setAutoDetectLocation}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Map Type: {mapType ? 'Satellite' : 'Standard'}</Text>
          <Switch
            value={mapType}
             onValueChange={handleMapTypeChange}
          />
        </View>

        <Text style={[styles.sectionName, { color: theme.text }]}>CUSTOMIZATION</Text>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Alert.alert('Feature coming soon')}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>Change Language</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Alert.alert('Set preferred location')}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>Set Default Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Alert.alert('Choose how to report crimes')}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>Crime Reporting Preferences</Text>
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
    height: '15%',
   alignItems:'center',
    flexDirection:'row',
    shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      borderRadius:20,
      
  },
  backArrow: {
    marginLeft: 20,
  },
  headerText: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
   
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 10,
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
