import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ReportBugScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [bugDescription, setBugDescription] = useState('');

  const handleSubmit = () => {
    if (!email.trim() || !bugDescription.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    Alert.alert('Thank you!', 'Your bug report has been submitted.');
    setEmail('');
    setBugDescription('');
  };

  return (
    <View style={styles.mainContainer}>
      
      <View style={styles.headerContainer}>
        <View style={{flexDirection:'row', gap:10, position:'absolute', bottom:20, alignItems:'center',gap:15,padding:15 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color="black" style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report a bug</Text>
      </View>
       </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Your Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Bug Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Describe the bug you encountered..."
          multiline
          numberOfLines={6}
          value={bugDescription}
          onChangeText={setBugDescription}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Bug Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    flexDirection:'column',
   
  },
  headerContainer: {
    backgroundColor: '#ADD8E6',
    height: '15%',
    marginBottom:20,
     shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      borderRadius:20,
      position:'absolute',
      width:'100%',
      zIndex:100,
     
      
  },
  backArrow: {
    fontSize: 25,
    color: 'black',
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    
    },
  content: {
    padding: 20,
    position:'relative',
    bottom:-150
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
    color: '#000',
  },
  multilineInput: {
    height: 120,
    marginBottom:40
  },
  submitButton: {
    backgroundColor: 'black', 
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop:30
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
});

export default ReportBugScreen;
