import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import InputField from '../../components/TextInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const LoginScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
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
    <View style={[styles.mainContainer, { backgroundColor: isDarkMode ? theme.background : '#91D8F7' }]}>
      <Image source={require('./media/abstract.png')} style={styles.abstractImage} />
      <View style={styles.textContainer}>
        <Text style={[styles.helloText, { color: theme.text }]}>Hello!</Text>
        <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome to SaferCampus</Text>
      </View>

      <Image source={require('./media/illustration.png')} style={styles.illustrationImage} />

      <View style={[styles.drawerContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.loginText, { color: theme.text }]}>Login</Text>

        <View style={styles.inputView}>
          <InputField
            placeholder="Email"
            iconName="email-outline"
            value={email}
            onChangeText={setEmail}
            style={styles.inputOverride}
          />

          <View style={styles.passwordContainer}>
            <InputField
              placeholder="Password"
              iconName="key-outline"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              style={[styles.inputOverride, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* <Text style={[styles.forgotText, { color: theme.text }]}>Forgot password?</Text> */}
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
          <Text style={[styles.plainText, { color: theme.text }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

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
    fontSize:40,
    fontFamily:'Montserrat-Bold',
    color:'white'
  },
  welcomeText:{
    fontFamily:'Montserrat-Bold',
    fontSize:20,
    color:'white'
  },
  abstractImage:{
    top:-5,
    left:-25,  
  },
  drawerContainer:{ 
    width:'100%',
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
    fontFamily:'Montserrat-Bold',
    fontSize:40,
    padding:'5%',
    left:10,
    top:30,
    position:'absolute'
  },
  inputOverride:{
    height:55,
    backgroundColor:'#D3D3D3',
  },
  forgotText:{
    marginTop:130,
    fontFamily:'Montserrat-Bold',
    marginBottom:30
  },
  inputView:{
    gap:'10',
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
    marginTop:90,
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
    fontFamily:'Montserrat-Regular'
  },
  linkText: {
    fontSize: 16,
    fontFamily:'Montserrat-Regular'
  },
  loginContainerDisabled: {
    backgroundColor: '#ccc',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
  },
  eyeIcon: {
    padding: 10,
  },
});