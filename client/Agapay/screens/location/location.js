import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import Icon from "react-native-vector-icons/FontAwesome";

const { width, height } = Dimensions.get("window");
const LocationComponent = ({ onLocationApproved }) => {
  const [locationApproved, setLocationApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);


  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    console.log(location)
    setLocationApproved(true);
    onLocationApproved(); 
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, locationApproved && styles.buttonApproved]}
        onPress={getLocation}
      >
        <Text style={styles.buttonText}>
          
          {locationApproved ?    <Icon name='map-marker' size={25} color="#ff" /> : "Get location"  }
        </Text>
      </TouchableOpacity>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '35%',
   
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  button: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 15,
    width: "100%",
    textAlign: 'center',
    height: width * 0.15,
    justifyContent: "center"
  },
  buttonApproved: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default LocationComponent;
