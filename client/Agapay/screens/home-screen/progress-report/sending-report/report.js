import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Button,
} from "react-native";
import {
  getFullScreenHeight,
  statusBarSize,
} from "./../../../../components/getFullScreen";
import { AuthContext } from "../../../../context/authContext";
import * as Location from "expo-location";
import React, { useState, useEffect, useContext } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { options } from "../../../../infoData/data";

const { width, height } = Dimensions.get("window");

// Define a professional color palette
const primaryColor = "maroon"; // Muted Blue Primary
const secondaryColor = "#ecf0f1"; // Light Gray Secondary
const accentColor = "#3498db"; // Blue Accent
const textColor = "#333"; // Dark Gray Text
const errorColor = "#e74c3c"; // Red for errors

const Progress = ({ navigation, route }) => {
  const [locationApproved, setLocationApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lat, setLat] = useState();
  const [long, setLong] = useState();
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert("Permission to access location was denied");
        return;
      }

      // Try to get the initial location with higher accuracy
      let initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // or Balanced, Medium, Low
      });

      setLocation(initialLocation);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);
  const handleGetLocation = async () => {
    try {
      // Request higher accuracy
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // or Balanced, Medium, Low
      });
      console.log("Location: " + JSON.stringify(location));
      console.log("lat:", location.coords.latitude);
      console.log("long:", location.coords.longitude);

      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.000999,
        longitudeDelta: 0.000999,
      });
      setLat(location.coords.latitude);
      setLong(location.coords.longitude);
      handleLocationApproved();
    } catch (error) {
      Alert.alert("Error", "Could not get location. Please try again.");
      console.error(error);
    }
  };

  const { name, img, photoUri, ...reminder } = route.params;
  const [state] = useContext(AuthContext);
  const [user_Id] = [state.user._id];
  const [reportText, setReportText] = useState("");
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const reminders = Object.values(reminder);
  const [isLocationApproved, setIsLocationApproved] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false); // New state for button enabled

  console.log(buttonEnabled);
  console.log(
    reportText,
    capturedPhotos.length,
    selectedValue,
    isLocationApproved
  );
  const handleLocationApproved = () => {
    setIsLocationApproved(true);
  };
  useEffect(() => {
    if (route.params?.photoUri) {
      setCapturedPhotos((prevPhotos) => [...prevPhotos, route.params.photoUri]);
      setFile(route.params?.photoUri);

      const file = route.params.photoUri.split("/").pop();
      console.log("Filename: ", file);
    }
  }, [route.params?.photoUri]);
  const removePhoto = (index) => {
    try {
      setCapturedPhotos((prevPhotos) =>
        prevPhotos.filter((_, i) => i !== index)
      );
    } catch (error) {
      console.error(error);
    }
  };
  const checkButtonEnabled = () => {
    if (
      reportText.trim() &&
      capturedPhotos.length > 0 &&
      selectedValue &&
      isLocationApproved
    ) {
      setButtonEnabled(true);
    } else {
      setButtonEnabled(false);
    }
  };
  useEffect(() => {
    checkButtonEnabled();
  }, [reportText, capturedPhotos, selectedValue, isLocationApproved]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!reportText.trim() || capturedPhotos.length === 0 || !selectedValue) {
        alert("Please fill all the fields");
        setLoading(false);
        return;
      }
      if (!reportText.trim()) {
        alert("Please enter a report");
        setLoading(false);
        return;
      }
      if (capturedPhotos.length === 0) {
        alert("Please add at least one photo");
        setLoading(false);
        return;
      }
      if (!selectedValue) {
        alert("Please select an option");
        setLoading(false);
        return;
      }
      if (!user_Id) {
        alert("User ID not found");
        setLoading(false);
        return;
      }
      const percentage = 10;
      const respond = "pending";
      const formData = new FormData();
      formData.append("emergency", name);
      formData.append("respond", respond);
      formData.append("lat", lat);
      formData.append("long", long);
      formData.append("location", selectedValue);
      formData.append("percentage", percentage);
      capturedPhotos.forEach((photo) => {
        formData.append("img", {
          uri: photo,
          name: photo.split("/").pop(),
          type: "image/jpeg",
        });
      });
      formData.append("message", reportText);
      formData.append("senderId", user_Id);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post("/send-report", formData, config);

      Alert.alert(
        "SOS Sent!", // Title
        "Your emergency report has been sent.", // Message
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Homepage"),
          },
        ],
        { cancelable: false }
      );
      console.log(JSON.stringify(formData));
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  return (
    <View style={styles.bodyContainer}>
      {/* reminder */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{name}</Text>
        </View>
        <View style={styles.firstaid}>
          <Text style={styles.firstaidText}>Reminder</Text>
          {reminders.map((reminder, index) => (
            <View key={index}>
              <Text style={styles.firstaidPro}>{reminder}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* input reports */}
      <ScrollView
        vertical
        style={styles.actionsContainer}
        contentContainerStyle={styles.scrollContent} // Add this
      >
        {/* camera icon */}
        {capturedPhotos.length < 1 && (
          <View style={styles.camcontainer}>
            <TouchableOpacity
              style={styles.cameraIconButton}
              onPress={() =>
                navigation.navigate("Camera", { name, img, ...reminder })
              }
            >
              <Icon name="camera" size={45} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* camera display */}
        <View
          style={[
            styles.imageScrollView,
            capturedPhotos.length <= 0
              ? { opacity: 0.2, marginTop: 0 }
              : { marginTop: height * 0.02 },
          ]}
        >
          <View style={styles.imageContainer}>
            {capturedPhotos.length <= 0 ? (
              <Text style={styles.backgroundText}>IMAGE</Text>
            ) : (
              capturedPhotos.map((photoUri, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.capturedImage}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Icon name="times-circle" size={22} color="white" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>

        {/* text display */}
        <View style={styles.textContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your concerns..."
            placeholderTextColor="#666"
            multiline={true}
            value={reportText}
            onChangeText={setReportText}
          />
        </View>
        {mapRegion ? (
          <MapView style={styles.map} region={mapRegion}>
            <Marker
              coordinate={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
              }}
              title="My Location"
            />
          </MapView>
        ) : (
          <Text style={{ textAlign: "center", padding: 20, color: "white" }}>
            Not yet located
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Get My Location" onPress={handleGetLocation} />
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.dropdownContainer}>
            <Picker
              required
              selectedValue={selectedValue}
              mode="dropdown"
              style={[styles.dropdownPicker]}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedValue(itemValue)
              }
            >
              <Picker.Item
                label="Nearby"
                value=""
                style={styles.dropdownTitle}
              />
              {options.map((x, i) => (
                <Picker.Item
                  label={x.label}
                  style={styles.dropdownItems}
                  value={x.value}
                  key={i}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.notificationButtons}>
          <TouchableOpacity
            disabled={!buttonEnabled}
            style={[
              styles.actionButton,
              buttonEnabled ? styles.notifyButton : styles.disabledButton,
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.notifyButtonText}>Send SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Progress;

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    backgroundColor: secondaryColor,
    height: getFullScreenHeight(),
  },
  map: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    overflow: "hidden", // Clip content to the border
  },
  buttonContainer: {
    marginVertical: 8,
    alignItems: "flex-end",
  },
  container: {
    paddingTop: statusBarSize(),
    paddingHorizontal: width * 0.04,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  locationContainer: {
    marginBottom: width * 0.04, // Spacing before the button
  },
  headerTitle: {
    textTransform: "uppercase",
    fontWeight: "600",
    fontSize: width * 0.06,
    color: primaryColor,
    textAlign: "center",
  },
  firstaid: {
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.03,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  firstaidText: {
    fontWeight: "bold",
    fontSize: width * 0.045,
    color: primaryColor,
    marginBottom: 5,
  },
  firstaidPro: {
    fontSize: width * 0.036,
    color: textColor,
    marginBottom: 6,
    fontStyle: "italic",
  },
  actionsContainer: {
    backgroundColor: primaryColor,
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    padding: width * 0.04,
  },
  scrollContent: {
    paddingBottom: width * 0.04,
  },
  camcontainer: {
    alignItems: "center",
    marginBottom: width * 0.04,
  },
  imageScrollView: {
    backgroundColor: "#fff",
    borderRadius: 10,

    padding: 5,
    borderWidth: 1,
    borderColor: secondaryColor,
    marginBottom: width * 0.04,
  },
  backgroundText: {
    fontSize: 24,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    opacity: 0.1,
    color: textColor,
  },
  photoWrapper: {
    position: "relative",
    margin: 2,
  },
  imageContainer: {
    maxHeight: width * 0.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.02,
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 15,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  capturedImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 8,
  },
  cameraIconButton: {
    padding: width * 0.04,
    backgroundColor: accentColor,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    borderColor: secondaryColor,
    borderWidth: 1,
  },
  dropdownItems: {
    fontSize: width * 0.036,
    color: textColor,
  },
  dropdownTitle: {
    textTransform: "uppercase",
    color: primaryColor,
    fontSize: width * 0.036,
    fontWeight: "bold",
  },
  textContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: width * 0.04,
    padding: width * 0.04,
    borderColor: secondaryColor,
    borderWidth: 1,
    height: width * 0.3, // Fixed height for the container
    overflow: "hidden", // Clip content that overflows
  },
  input: {
    fontSize: width * 0.04,
    color: textColor,
  },
  notificationButtons: {
    alignItems: "center",
    marginBottom: width * 0.04,
  },
  actionButton: {
    width: "100%",
    padding: width * 0.035,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notifyButton: {
    backgroundColor: accentColor,
  },
  disabledButton: {
    backgroundColor: secondaryColor,
    opacity: 0.7,
  },
  notifyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.045,
    textTransform: "uppercase",
  },
  errorText: {
    color: errorColor,
    fontSize: width * 0.035,
    marginTop: 5,
  },
});
