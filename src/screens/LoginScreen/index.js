import { StyleSheet, Text, View,TextInput,Image,TouchableOpacity, Alert } from 'react-native'
import React, {useState} from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import InputField from '../../components/TextInput';
import { useAuth } from '../../context/AuthContext'; 


const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        navigation.replace('Main');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style ={styles.mainContainer}>
      <Image 
                source={require('./media/abstract.png')} 
                style={styles.abstractImage}
              />
      <View style ={styles.textContainer}> 
        <Text style ={styles.helloText}>Hello!</Text>
        <Text  style ={styles.welcomeText}>Welcome to SaferCampus</Text>
      </View>

      <Image 
                    source={require('./media/illustration.png')} 
                    style={styles.illustrationImage}
          />

      <View style ={styles.drawerContainer}>
            <Text style ={styles.loginText}>Login</Text>

              <View style={styles.inputView}>
                <InputField placeholder="Email" iconName="email-outline" value={email} onChangeText={setEmail} style={styles.inputOverride} 
                />

                <InputField placeholder="Password" iconName="key-outline" value={password} secureTextEntry={true} onChangeText={setPassword} style={styles.inputOverride}
                />
              </View>

              <Text style ={styles.forgotText}> Forgot password?</Text>
              <TouchableOpacity 
                      style={[styles.loginContainer, loading && styles.loginContainerDisabled]} 
                      activeOpacity={0.7}
                      onPress={handleLogin}
                      disabled={loading}
                    >
                      <Text style={styles.loginButtonText}>
                        {loading ? 'Logging in...' : 'Login'}
                      </Text>
                    </TouchableOpacity>

              <View style={styles.signUpTextContainer}>
        <Text style={styles.plainText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
              <Text style={styles.linkText}>Sign up</Text>  
            </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
        backgroundColor:'#91D8F7',
        width:'100%',    
    },
    textContainer:{
      flexDirection:'column',
      gap:'10%',
      top:'10%',
      marginLeft:'10%',
      position:'absolute'
    },
    helloText:{
      color:'white',
      fontSize:40,
      fontFamily:'Montserrat-Bold'
    },
    welcomeText:{
      color:'white',
      fontFamily:'Montserrat-Bold',
      fontSize:20,
    },
    abstractImage:{
      top:-5,
      left:-25,  
    },
    drawerContainer:{ 
    width:'100%',
    backgroundColor:'white',
    position:'absolute',
    height:660,
    bottom:0,
    borderRadius:20,
    alignItems:'center',
    justifyContent:'center',
    
    },
    illustrationImage:{
      height:150,
      width:150,
      right:10,
     position:'absolute',
     zIndex:15,
     top:'20%'
    },
    loginText:{
      color:'black',
      fontFamily:'Montserrat-Bold',
      fontSize:40,
      padding:'5%',
      left:10,
      top:30,
      position:'absolute'
    },
    inputOverride:{
      height:55
    },
    forgotText:{
      color:'#239DD6',
      marginTop:130,
      fontFamily:'Montserrat-Bold',
      marginBottom:30
    },
    inputView:{
      gap:'25',
      position:'absolute',
      width:'100%',
      alignItems:'center',
      justifyContent:'center',
      top:'20%', 
    },
    loginContainer:{
      backgroundColor:'#239DD6',
      width:'60%',
      height:'7%',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:12,
      marginTop:30,
      padding:'10',
           
    },
    loginButtonText:{
      color:'white',
      fontSize:20,
      fontFamily:'Montserrat-Regular'
    },
     signUpTextContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  plainText: {
    fontSize: 16,
    color: '#333',
    fontFamily:'Montserrat-Regular'
  },
  linkText: {
    fontSize: 16,
    color: '#239DD6',
    fontFamily:'Montserrat-Regular'
  },
  loginContainerDisabled: {
    backgroundColor: '#ccc',
  },
    
})