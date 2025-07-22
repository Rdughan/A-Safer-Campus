import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PRIMARY_BLUE = '#ADD8E6';

const PrivacyScreen = ({ navigation }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataConsent, setDataConsent] = useState(false);

  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
          <View style ={{flexDirection:'row', alignItems:'center'}}> 
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={25} color="black" style={styles.backArrow} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Privacy</Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionName}>PRIVACY CONTROLS</Text>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Private Profile</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Share Location with App</Text>
          <Switch
            value={shareLocation}
            onValueChange={setShareLocation}
          
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Consent to Data Use</Text>
          <Switch
            value={dataConsent}
            onValueChange={setDataConsent}
          />
        </View>

        <Text style={styles.sectionName}>DOCUMENTS</Text>

        <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Privacy Policy')}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Terms of Service')}>
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>

     
      </ScrollView>
    </View>
  );
};

export default PrivacyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: PRIMARY_BLUE,
    height: '14%',
    justifyContent: 'flex-end',
    paddingBottom: 20,
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
    marginLeft: 20,
   
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
