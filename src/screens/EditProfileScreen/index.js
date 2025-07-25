import { StyleSheet, Text, View, TouchableOpacity,Image} from 'react-native'
import React, { useState }from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import InputField from '../../components/TextInput';

const EditProfileScreen = ({navigation}) => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Phone, setPhone] = useState('');

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
         <TouchableOpacity style ={styles.arrow} onPress={() => navigation.goBack()}>    
            <Ionicons name="arrow-back" size={24} color="#000" />     
         </TouchableOpacity>

        <Text style ={styles.editProfileText}>Edit Profile</Text>
        <TouchableOpacity style={styles.checkmark} onPress={() => navigation.goBack()}>
            <Ionicons name="checkmark" size={30} color="#32CD32"  />   
        </TouchableOpacity>

      </View>

    <TouchableOpacity style={{height:100, width:100, alignSelf:'center' }}>
      <Image 
             source={require('./media/pfp.png')} 
             style={styles.pfp}   
       />
        <View style={styles.cameraIconContainer}>
          <Ionicons name="camera" size={20} color="#000" />
        </View>
    </TouchableOpacity>    
       

        <View style={styles.inputView}>
          <Text style ={styles.inputTitle}>Name</Text>
                <InputField placeholder="John Doe" iconName="email-outline" value={name} onChangeText={setName} style={styles.inputOverride}/>            
              <Text style ={styles.inputTitle}>Email Address</Text>
                <InputField placeholder="johndoe@gmail.com" iconName="email-outline" value={email} onChangeText={setEmail} style={styles.inputOverride}/>
                 <Text style ={styles.inputTitle}>Password</Text>
                <InputField placeholder="Password" iconName="key-outline" value={password} secureTextEntry={true} onChangeText={setPassword} style={styles.inputOverride} />
                  <Text style ={styles.inputTitle}>Phone Number</Text>
                 <InputField placeholder="0202222233" iconName="phone-outline" value={Phone} onChangeText={setPhone} style={styles.inputOverride} />
              </View>  

    </View>
  )
}

export default EditProfileScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
    },
    headerContainer:{
        height:'14%',
        flexDirection:'row',  
        alignItems:'center',
        backgroundColor: '#ADD8E6',
         shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      borderRadius:20,
      width:'100%',
      zIndex:100,
      marginBottom:25,
      paddingTop:20
      
    },
    arrow:{
    left:20,
    top:15, 
      
    },
    editProfileText:{
      left:'30%',
      top:15,
      textAlign:'center',
      position:'relative',
      fontSize:25,
      fontFamily:'Montserrat-Bold',
    },
    checkmark:{
        right:30,
        top:70,
        position:'absolute'
    },
    pfp:{
      height:100,
      width:100,
      borderRadius:50,
    },
    inputView:{
      gap:20,
      alignSelf:'center',
      marginTop:40
    },
    inputTitle:{
       fontSize:22,
      fontFamily:'Montserrat-Bold',
    },
     cameraIconContainer: {
    position: 'absolute',
    width:40,
    height:40,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    right:0,
    bottom:0,
  },
})