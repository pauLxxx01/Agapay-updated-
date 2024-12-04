import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFullScreenHeight, statusBarSize } from "../../../components/getFullScreen";

console.log(
`
Device Dimensions:
- Status bar Height: ${statusBarSize().toFixed(2)}
- Screen Height: ${Dimensions.get("screen").height.toFixed(2)}
- Full Screen Height: ${getFullScreenHeight().toFixed(2)}
`
);

const Welcome = () => {
  const navigation = useNavigation();
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const dataString = await AsyncStorage.getItem("@auth");
        if (dataString) {
          const data = JSON.parse(dataString);
          console.log(data.token);
          setUserToken(data.token);
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
    };

    fetchToken();
  }, []);

  const handlePress = () => {
    // Navigate based on token availability
    navigation.navigate(userToken ? "Homepage" : "SlidingImg");
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ImageBackground
        source={require("../../../assets/agapay/background/agapaybg.jpg")}
        style={styles.background}
      >
        <Image
          source={require("../../../assets/agapay/logo/logo.png")}
          style={styles.logo}
        />

        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: getFullScreenHeight(),
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: "contain",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#7E0000",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
