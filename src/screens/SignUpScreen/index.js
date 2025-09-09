import { StyleSheet, Text, View, Image, TouchableOpacity,Modal, Alert } from 'react-native'
import React, { useState } from 'react'
import InputField from '../../components/TextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SuccessModal from '../SuccessScreen';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const SignUpScreen = ({navigation}) => {
  const { theme, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [studentID, setStudentID] = useState('');
  const [password, setPassword] = useState('');
  const [Confirmpassword, setConfirmPassword] = useState('');
  const [Phone, setPhone] = useState('');
  const [username, setUsername] = useState('Henry');
  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { signUp } = useAuth();

  const handleSignUpPress = async () => {
    // Validation
    if (!email || !studentID || !password || !Confirmpassword || !Phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== Confirmpassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        student_id: studentID,
        phone: Phone,
        username: username
      };

      // Define redirect URL for email confirmation
      // Use the same URL you set in Supabase Authentication Settings
      const redirectTo = 'exp://localhost:8081'; // Development URL
      // For production, use: 'safecampus://'
      
      const { data, error } = await signUp(email, password, userData, redirectTo);
      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        // Show the success modal
        setShowSuccessModal(true);
        
        // After 1.5 seconds, hide modal and navigate
        setTimeout(() => {
          setShowSuccessModal(false);
          navigation.navigate('Main');
        }, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  
  
  return (
     
    <View style={[styles.mainContainer, { backgroundColor: isDarkMode ? theme.background : '#91D8F7' }]}>
          <Image 
                    source={require('./media/abstract.png')} 
                    style={styles.abstractImage}
                  />
           
          <View style={[styles.drawerContainer, { backgroundColor: theme.card }]}>
            <TouchableOpacity style ={styles.backToLoginView}
              onPress={() => navigation.goBack()}> 
              <Ionicons name="arrow-back" size={20} color={theme.text} />
                <Text style={[styles.backText, { color: theme.text }]}>Back to login</Text>
                 
            </TouchableOpacity>
            <Text style={[styles.signUpText, { color: theme.text }]}>Sign Up</Text>

              <View style={styles.inputView}>
                <InputField placeholder="Email" iconName="email-outline" value={email} onChangeText={setEmail} style={styles.inputOverride}/>            
                <InputField placeholder="Student ID" iconName="account-outline" value={studentID} onChangeText={setStudentID} style={styles.inputOverride} /> 
                <InputField
                  placeholder="Password"
                  iconName="key-outline"
                  value={password}
                  secureTextEntry={true}
                  onChangeText={setPassword}
                  style={styles.inputOverride}
                  textContentType="none" // Disable autofill
                  autoComplete="off" // Disable autofill
                />
                <InputField
                  placeholder="Confirm Password"
                  iconName="key-outline"
                  value={Confirmpassword}
                  secureTextEntry={true}
                  onChangeText={setConfirmPassword}
                  style={styles.inputOverride}
                  textContentType="none" // Disable autofill
                  autoComplete="off" // Disable autofill
                />
                 <InputField placeholder="Phone" iconName="phone-outline" value={Phone} onChangeText={setPhone} style={styles.inputOverride} />
              </View>  

              <TouchableOpacity 
                style={[styles.loginContainer, loading && styles.loginContainerDisabled]} 
                activeOpacity={0.7}
                onPress={handleSignUpPress}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>   
        </View>   
            <SuccessModal 
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
     </View>
  )
}

export default SignUpScreen

const styles = StyleSheet.create({
   mainContainer:{
        flex:1,
        width:'100%',    
        height:'100%'
    },
    drawerContainer:{ 
    width:'100%',
    position:'absolute',
    height:'80%',
    bottom:0,
    borderRadius:20,
  },
  backText:{
    fontFamily:'Montserrat-Regular'
  },
  signUpText:{
      fontFamily:'Montserrat-Bold',
      fontSize:40,
      padding:'5%',
      left:10,
      top:50,
      position:'absolute'
    },
    inputOverride:{
      marginHorizontal:20,
      marginTop:25,
      top:100,  
      backgroundColor:'#D3D3D3',
 
    },
     loginContainer:{
      backgroundColor:'#239DD6',
      marginHorizontal:40,
      height:'auto',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:12,
      bottom:-170,
      padding:'10',
           
    },
    loginButtonText:{
      color:'white',
      fontSize:20,
      fontFamily:'Montserrat-Regular'
    },
    backToLoginView:{
      flexDirection:'row',
      alignItems:'center',
      left:20,
      top:20,
      gap:10
      
    },
     modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#239DD6',
  },
})