import { StyleSheet, Text, View, Switch } from 'react-native';
import React, { useState } from 'react';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.logoName}>SaferCampus</Text>
        <Text style={styles.slogan}>Your personal safety settings</Text>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Receive Alerts</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: '#239DD6' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Share Location</Text>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: '#ccc', true: '#239DD6' }}
            thumbColor={locationEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFDFF',
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  headerContainer: {
    flex: 1,
    alignItems: 'center',
    top: '7%',
  },
  logoName: {
    fontSize: 20,
    color: '#239DD6',
    fontFamily: 'Montserrat-Regular',
  },
  slogan: {
    fontFamily: 'Montserrat-Variable',
    color: 'black',
  },
  settingsContainer: {
    flex: 2,
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
    color: '#239DD6',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  settingText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
});
