import { StyleSheet, Text, View, Dimensions,Image,TextInput,TouchableOpacity } from 'react-native';
import React, { useState } from 'react'
import MapView, { UrlTile, Marker,} from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {

    const [searchQuery, setSearchQuery] = useState('');
    const [markerCoords, setMarkerCoords] = useState({
      latitude: 5.55,
      longitude: -0.2,
    });
  
  return (
    <View style={styles.container}>
      
      <View style={styles.headerContainer}>
         <View style ={styles.logoNameView}> 
            <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4413/4413044.png' }} 
                  style={styles.logo} 
                />
                <Text style={styles.logoName}>SaferCampus</Text>
          </View>  
            <View style={styles.searchContainer}> 
              <TextInput
                style={styles.searchBar}
                placeholder="Search for a campus..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => {
                }}
              />
              <TouchableOpacity
                  style={styles.searchIconButton}
                  onPress={() => alert(`Searching for ${searchQuery}`)}
                >
                  <Icon name="search" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
      </View>

      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude:5.6064,
          longitude:-0.2000,
          latitudeDelta:0.01,
          longitudeDelta:0.01
        }}
        
      >
        
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"

          maximumZ={19}
          tileSize={256}
        />

        <Marker
          coordinate={{ latitude: 5.55, longitude: -0.2 }}
          title="You are here"
          description="Welcome to Accra"
        />
      </MapView>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    width:'100%'
  },

  map: {
    flex: 1,
    width:'100%',
    
  },
  headerContainer:{
    width:'100%',
    height:'auto',
    backgroundColor:'white',
    alignItems:'center',
    justifyContent:'center',
    padding:'10%',
    borderRadius:20,
    position:'absolute',
    top: 0, 
    zIndex: 10,
   gap:20
    
  },
  logo: {
    width: 30,  // Adjust width
    height: 30, // Adjust height
    
  },
  logoName:{
    fontSize:17,
    color:'black', 
    fontFamily: 'Montserrat-Bold'
  },
  logoNameView:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:5,
    width:'100%',
    top:'10%',
  },
  searchBar: {
    zIndex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    borderWidth:0.9,
    width:'80%',
    borderColor:'#239DD6',
    color:'black',
    overflow: 'hidden',
    height:'auto',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    gap: 10,
  },
  searchIconButton: {
    backgroundColor: '#239DD6',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})