import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { RadioButton } from "react-native-paper";
import { Audio } from "expo-av";


const { width, height } = Dimensions.get("window");

const Notification = ({ navigation }) => {
  const [alertType, setAlertType] = useState("ringVibrate");
  const [sound, setSound] = useState();

  async function playSound() {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../../assets/mp3/alert.mp3")
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  }

  async function stopVibrate() {
    Vibration.cancel();
    console.log("Vibration stopped");
  }
  async function stopSound() {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound();
      } catch (error) {
        console.log("Error stopping sound:", error);
      }
    }
  }
  const handleAlert = async (type) => {
    setAlertType(type);
    await stopSound();

    if (type === "ringVibrate") {
      await playSound();

      Vibration.vibrate([0, 2000, 1000, 2000, 1000, 2000, 1000, 2000], false);
    } else if (type === "ringOnly") {
      await stopVibrate();
      await playSound();
    } else if (type === "vibrateOnly") {
      Vibration.vibrate([0, 2000, 1000, 2000, 1000, 2000, 1000, 2000], false);
    }
  };

  useEffect(() => {
    return () => {
      stopSound();
      stopVibrate();
    };
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <Image
        source={require("../../assets/agapay/logo/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.header}>Alert Mechanism</Text>

      <View style={styles.container}>
        <View style={styles.radioButton}>
          <RadioButton
            value="ringVibrate"
            status={alertType === "ringVibrate" ? "checked" : "unchecked"}
            onPress={() => handleAlert("ringVibrate")}
            color="maroon"
          />
          <Text style={styles.radioText}>Ring and Vibrate</Text>
        </View>

        <View style={styles.radioButton}>
          <RadioButton
            value="ringOnly"
            status={alertType === "ringOnly" ? "checked" : "unchecked"}
            onPress={() => handleAlert("ringOnly")}
            color="maroon"
          />
          <Text style={styles.radioText}>Ring Only</Text>
        </View>

        <View style={styles.radioButton}>
          <RadioButton
            value="vibrateOnly"
            status={alertType === "vibrateOnly" ? "checked" : "unchecked"}
            onPress={() => handleAlert("vibrateOnly")}
            color="maroon"
          />
          <Text style={styles.radioText}>Vibrate Only</Text>
        </View>

        <View style={styles.radioButton}>
          <RadioButton
            value="silentMode"
            status={alertType === "silentMode" ? "checked" : "unchecked"}
            onPress={() => handleAlert("silentMode")}
            color="maroon"
          />
          <Text style={styles.radioText}>Silent Mode</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          stopSound();
          stopVibrate();
          Alert.alert(
            "Notification",
            "Settings saved! Sound has been stopped.",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
  },
  backButton: {
    position: "absolute",
    top: height * 0.04,
    left: width * 0.04,
    zIndex: 1,
    padding: 5,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    alignSelf: "center",
    marginBottom: height * 0.02,
    marginTop: height * 0.03,
    resizeMode: "contain",
  },
  container: {
    padding: width * 0.05,
    borderRadius: 15,
    backgroundColor: "#F1EFEF",
    elevation: 4,
    shadowColor: "#F1EFEF",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    marginHorizontal: width * 0.02,
    marginBottom: height * 0.03,
  },
  header: {
    fontSize: width * 0.06,
    fontWeight: "900",
    color: "black",
    marginBottom: height * 0.02,
    textAlign: "left",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.01,
  },
  radioText: {
    fontSize: width * 0.045,
    fontWeight: "700",
    color: "#333",
    marginLeft: width * 0.02,
  },
  saveButton: {
    backgroundColor: "#8B0000",
    paddingVertical: height * 0.01,
    width: height * 0.2,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: width * 0.1,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    marginLeft: height * 0.2,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: width * 0.05,
    fontWeight: "700",
  },
});
export default Notification;
