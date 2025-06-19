import { StyleSheet, Text, View, Image, TouchableOpacity,Modal } from 'react-native'
import React, { useState } from 'react'
import InputField from '../../components/TextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SuccessModal from '../SuccessScreen';


const SignUpScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [studentID, setStudentID] = useState('');
  const [password, setPassword] = useState('');
  const [Confirmpassword, setConfirmPassword] = useState('');
  const [Phone, setPhone] = useState('');
  const [username, setUsername] = useState('Henry');

    const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSignUpPress = () => {
    // Your signup validation logic
    
    // Show the success modal
    setShowSuccessModal(true);
    
    // After 1.5 seconds, hide modal and navigate
    setTimeout(() => {
      setShowSuccessModal(false);
      navigation.navigate('Main');
    }, 1000);
  };

  
  
  return (
     
    <View style ={styles.mainContainer}>
          <Image 
                    source={require('./media/abstract.png')} 
                    style={styles.abstractImage}
                  />
           
          <View style ={styles.drawerContainer}>
            <TouchableOpacity style ={styles.backToLoginView}
              onPress={() => navigation.goBack()}> 
              <Ionicons name="arrow-back" size={20} color="#000" />
                <Text style ={styles.backText}>Back to login</Text>
                 
            </TouchableOpacity>
            <Text style ={styles.signUpText}>Sign Up</Text>

              <View style={styles.inputView}>
                <InputField placeholder="Email" iconName="email-outline" value={email} onChangeText={setEmail} style={styles.inputOverride}/>            
                <InputField placeholder="Student ID" iconName="account-outline" value={studentID} onChangeText={setStudentID} style={styles.inputOverride} /> 
                <InputField placeholder="Password" iconName="key-outline" value={password} secureTextEntry={true} onChangeText={setPassword} style={styles.inputOverride} />
                <InputField placeholder="Confirm Password" iconName="key-outline" value={Confirmpassword} secureTextEntry={true} onChangeText={setConfirmPassword} style={styles.inputOverride} />
                 <InputField placeholder="Phone" iconName="phone-outline" value={Phone} onChangeText={setPhone} style={styles.inputOverride} />
              </View>  

              <TouchableOpacity 
                style={styles.loginContainer} 
                activeOpacity={0.7}
                onPress={handleSignUpPress} 
              >
                <Text style={styles.loginButtonText}>Sign Up</Text>
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
        backgroundColor:'#91D8F7',
        width:'100%',    
        height:'100%'
    },
    drawerContainer:{ 
    width:'100%',
    backgroundColor:'white',
    position:'absolute',
    height:'80%',
    bottom:0,
    borderRadius:20,
  },
  backText:{
    fontFamily:'Montserrat-Regular'
  },
  signUpText:{
      color:'black',
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