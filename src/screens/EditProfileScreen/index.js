import { StyleSheet, Text, View, TouchableOpacity,Image} from 'react-native'
import React, { useState }from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import InputField from '../../components/TextInput';

const EditProfileScreen = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Phone, setPhone] = useState('');

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
         <TouchableOpacity style ={styles.arrow}>    
            <Ionicons name="arrow-back" size={20} color="#000" />     
         </TouchableOpacity>

        <Text style ={styles.editProfileText}>Edit Profile</Text>
        <TouchableOpacity style={styles.checkmark}>
            <Ionicons name="checkmark" size={30} color="#32CD32"  />
        </TouchableOpacity>

      </View>

      <Image 
             source={require('./media/pfp.png')} 
             style={styles.pfp}
       />

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
        width:'100%',
        backgroundColor:'white',
        height:130,
        flexDirection:'row',  
        
        alignItems:'center'  
    },
    arrow:{
    left:20,
    top:15,
       
    },
    editProfileText:{
      left:'33%',
      top:15,
      textAlign:'center',
      position:'relative',
      fontSize:22,
      fontFamily:'Montserrat-Bold',
    },
    checkmark:{
        right:30,
        top:60,
        position:'absolute'
    },
    pfp:{
      height:100,
      width:100,
      borderRadius:50,
      alignSelf:'center'
    },
    inputView:{
      gap:20,
      alignSelf:'center',
      marginTop:60
    },
    inputTitle:{
       fontSize:22,
      fontFamily:'Montserrat-Bold',
    }
})