import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerIndieID, unregisterIndieDevice } from "native-notify";
import axios from "axios";

import SubmitButton from "../../../components/SubmitButton";
import InputBox from "../../../components/TextFieldBox";
import { AuthContext } from "../../../context/authContext";

const { width, height } = Dimensions.get("window");

import * as Notifications from "expo-notifications";
import LoadingScreen from "../../../components/loading/loading";

export default function Login({ navigation }) {
  //global state
  const [state, setState] = useContext(AuthContext);
  const [error, setError] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState("");

  const [pushToken, setPushToken] = useState("");

  useEffect(() => {
    const getPushToken = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === "granted") {
          const token = await Notifications.getExpoPushTokenAsync();
          setPushToken(token.data);
          console.log("Push token: ", token.data);
        } else {
          Alert.alert("Alert", "Notification permissions not granted.");
        }
      } catch (error) {
        console.error("Error getting push token:", error);
      }
    };

    if (Platform.OS === "ios" || Platform.OS === "android") {
      getPushToken();
    } else {
      console.log("Push notifications are not supported on this platform.");
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log("USERS: ", userId, password);
      if (!userId || !password) {
        setLoading(false);
        Alert.alert(
          "Alert",
          "Please provide both student number and password!"
        );

        return;
      }
      const user_id = userId.toUpperCase();
      const { data } = await axios.post(`/mobile/user/login`, {
        account_id: user_id,
        password,
      });
      console.log("data: ", data.user._id);
      await axios.put(`/save-token/${data.user._id}`, {
        token: pushToken,
      });
      console.log("data: ", data);
      setState(data);
      await AsyncStorage.setItem("@auth", JSON.stringify(data));
      Alert.alert("Success", data.message || "Login successful!");
      navigation.navigate("Homepage");
      getLocalStorageData();
    } catch (error) {
      Alert.alert(
        "Login failed",
        error.response.data.message || "An error occurred. Please try again."
      );
      console.log("Login failed", error.response.data.message);
    } finally {
      setLoading(false);
    }
  };


  const getLocalStorageData = async () => {
    let dataString = await AsyncStorage.getItem("@auth");
    let data = dataString ? JSON.parse(dataString) : null;
    console.log("Full data from AsyncStorage:", data);
    console.log("Local Storage user:", data ? data.user : "No data found");
    console.log("Token:", data.token);
  };

  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <ImageBackground
      source={require("../../../assets/agapay/background/agapaybg.jpg")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0} // Ensures the keyboard avoids the view correctly
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.welcomeText}>Welcome ka-AGAPAY!</Text>
          <Text style={styles.subText}>Log in as User</Text>
          <Image
            source={require("../../../assets/agapay/logo/logo.png")}
            style={styles.logo}
          />
          <InputBox
            styleInputBox={styles.input}
            inputTitle={"Name"}
            autoComplete="userId"
            placeholder={"Student Number"}
            value={userId}
            setValue={setUserId}
          />

          <InputBox
            styleInputBox={styles.input}
            inputTitle={"Password"}
            placeholder={"Password"}
            secureTextEntry={true}
            autoComplete="password"
            value={password}
            setValue={setPassword}
          />

          <SubmitButton
            styleBtn={styles.loginButton}
            styleTxt={styles.loginButtonText}
            btnTitle="Login"
            loading={loading}
            handleSubmit={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
  },
  background: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: height * 0.05,
    left: width * 0.05,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: width * 0.08,
    color: "#7E0000",
  },
  welcomeText: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
    marginBottom: height * 0.01,
  },
  subText: {
    fontSize: width * 0.05,
    color: "#555",
    textAlign: "left",
    marginBottom: height * 0.03,
    fontWeight: "700",
  },
  logo: {
    width: width * 0.7,
    height: height * 0.3,
    alignSelf: "center",
    resizeMode: "contain",
    marginBottom: height * 0.05,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
    fontSize: width * 0.045,
    color: "#000",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  loginButton: {
    alignSelf: "center",
    backgroundColor: "#800000",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.2,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    marginTop: height * 0.03,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: width * 0.05,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.01,
  },
});
