import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import { AuthContext } from "../../../../context/authContext";
import { options } from "../../../../infoData/data";
{
  /* Dimensions */
}
const { width, height } = Dimensions.get("window");
import {
  getFullScreenHeight,
  statusBarSize,
} from "./../../../../components/getFullScreen";

import axios from "axios";

const Progress = ({ navigation, route }) => {
  const { name, img, photoUri, ...reminder } = route.params;
  const [state] = useContext(AuthContext);
  const [user_Id] = [state.user._id];

  const [reportText, setReportText] = useState("");
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [file, setFile] = useState("");

  const [loading, setLoading] = useState(false);
  const reminders = Object.values(reminder);

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
      const formData = new FormData();
      formData.append("emergency", name);
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
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0} // Adjust offset as needed
    >
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
          keyboardShouldPersistTaps="handled"
          style={styles.actionsContainer}
        >
          {/* camera icon */}

          {capturedPhotos.length < 1 && ( // Only show the icon if there's not exactly one photo
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
            horizontal
            style={[
              styles.imageScrollView,
              capturedPhotos.length <= 0
                ? { opacity: 0.2, marginTop: 0 }
                : { opacity: 1, marginTop: height * 0.05 },
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
          <ScrollView vertical style={styles.textContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your concerns..."
              placeholderTextColor="#666"
              multiline={true}
              value={reportText}
              onChangeText={setReportText}
            />
          </ScrollView>

          <View style={styles.dropdownContainer}>
            <Picker
              required
              selectedValue={selectedValue}
              mode="dropdown"
              style={[styles.dropdownPicker]} // Added borderRadius
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

          <View style={styles.notificationButtons}>
            <TouchableOpacity
              style={styles.notifyButton}
              onPress={handleSubmit}
            >
              <Text style={styles.notifyButtonText}>Send SOS</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Progress;

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    height: getFullScreenHeight(),
  },
  container: {
    paddingTop: statusBarSize(),

    justifyContent: "center",
    paddingHorizontal: width * 0.04,
    gap: 12,
  },
  header: {
    width: "100%",
    alignItems: "center",
  },

  headerTitle: {
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: width * 0.07,
    color: "maroon",
    textAlign: "center",
  },
  firstaid: {
    backgroundColor: "#FFF",
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.02,
    borderRadius: 15,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  firstaidText: {
    fontWeight: "bold",
    fontSize: width * 0.05,
    color: "maroon",
  },
  firstaidPro: {
    fontSize: width * 0.036,
    color: "#000",
    marginBottom: 6,
    fontStyle: "italic",
  },

  //Input Station
  actionsContainer: {
    flex: 1,

    backgroundColor: "maroon",
    borderTopRightRadius: width * 0.2,
    borderTopLeftRadius: width * 0.2,
  },

  //Camera
  camcontainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  imageScrollView: {
    backgroundColor: "white",
    marginHorizontal: width * 0.05,
    borderRadius: width * 0.05,
  },
  backgroundText: {
    position: "relative",
    fontSize: 42,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    opacity: 0.2,
    bottom: 0,
    top: 0,
    left: 0,
    width: "100%",
  },
  photoWrapper: {
    position: "relative",
    margin: 2,
  },
  imageContainer: {
    maxHeight: width * 0.45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.02,
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    opacity: 0.3,
    borderRadius: 20,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  capturedImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 10,
  },
  cameraIconButton: {
    padding: width * 0.05,
    justifyContent: "center",
    alignItems: "center",
  },
  //dropdown list
  dropdownContainer: {
    backgroundColor: "white",
    borderRadius: width * 0.05,
    marginHorizontal: width * 0.05,
  },
  dropdownItems: {
    fontSize: width * 0.04, // Font size for items
  },
  dropdownTitle: {
    textTransform: "uppercase",
    color: "maroon", // Text color for items
    fontSize: width * 0.04, // Font size for items
    fontWeight: "bold", // Bold text for title
  },
  textContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.03,
    minHeight: width * 0.25,
    backgroundColor: "#fff",
    borderRadius: width * 0.05,
    marginHorizontal: width * 0.05,
    marginVertical: width * 0.05,
  },
  input: {
    fontSize: width * 0.04,
  },
  notificationButtons: {
    margin: width * 0.05,
  },
  notifyButton: {
    width: "100%",
    backgroundColor: "white",
    padding: width * 0.03,
    borderRadius: width * 0.05,
  },
  notifyButtonText: {
    textTransform: "uppercase",
    fontWeight: "bold",
    color: "maroon",
    letterSpacing: 2,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});
