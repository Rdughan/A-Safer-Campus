import React, { useState, useContext } from 'react';
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
import { ThemeContext } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/themes';

const ReportBugScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const { isDarkMode } = useContext(ThemeContext);
  const colors = isDarkMode ? darkTheme : lightTheme;

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
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        <View style={{flexDirection:'row', gap:10, position:'absolute', bottom:20, alignItems:'center',gap:15,padding:15 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color={colors.text} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Report a bug</Text>
      </View>
       </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Your Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="you@example.com"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { color: colors.text }]}>Bug Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Describe the bug you encountered..."
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          multiline
          numberOfLines={6}
          value={bugDescription}
          onChangeText={setBugDescription}
          textAlignVertical="top"
        />

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
          <Text style={[styles.submitButtonText, { color: colors.text }]}>Submit Bug Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    flexDirection:'column',
   
  },
  headerContainer: {
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
