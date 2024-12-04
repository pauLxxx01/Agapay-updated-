import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  Alert,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StarRating from "react-native-star-rating-widget";
import { AuthContext } from "../../context/authContext";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const FeedbackComponent = ({ navigation }) => {
  const [state] = useContext(AuthContext);

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [displayWithName, setDisplayWithName] = useState(false);
  const [displayAnonymously, setDisplayAnonymously] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(false);
  const [selectedImprovements, setSelectedImprovements] = useState([]);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [name, setName] = useState("");
  const username = state.user?.name;

  const user_id = String(state.user?._id);

  const improvementOptions = [
    "Overall Services",
    "External Communication Process",
    "Rescue Speed and Efficiency",
    "Staff Preparedness",
    "Evacuation Planning",
    "Dissemination of Information",
  ];

  const isFeedbackComplete = () => {
    if (
      rating === 0 ||
      selectedImprovements.length === 0 ||
      (!displayWithName && !displayAnonymously) ||
      feedbackText.trim() === ""
    ) {
      return false;
    }
    return true;
  };

  const openModal = () => {
    if (isFeedbackComplete()) {
      setSelectedAlert(true);
    } else {
      Alert.alert("Incomplete Feedback", "Please complete the feedback.");
    }
  };

  const closeModal = () => {
    setSelectedAlert(false);
  };

  const resetFormData = () => {
    setRating(0);
    setFeedbackText("");
    setDisplayWithName(false);
    setDisplayAnonymously(false);
    setSelectedImprovements([]);
  };

  const handleCheckboxChange = (type) => {
    if (type === "anonymous") {
      setDisplayWithName(false); // Set name display to false when anonymous is selected
      setDisplayAnonymously(true); // Display anonymously
      setName("*******");
    } else {
      setDisplayWithName(true); // Set to display the name
      setDisplayAnonymously(false); // Disable anonymous display
      setName(username);
      alert(name); // Use actual name
    }
  };

  const handleImprovementSelect = (option) => {
    setSelectedImprovements((prevSelected) => {
      if (prevSelected.includes(option)) {
        return prevSelected.filter((item) => item !== option);
      } else {
        return [...prevSelected, option];
      }
    });
  };

  const showThankYouScreen = () => {
    setThankYouVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setThankYouVisible(false);
        navigation.navigate("Homepage");
      });
    }, 5000);
  };

  const CustomCheckBox = ({ value, onValueChange, label }) => {
    return (
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() =>
          onValueChange(
            label === "Display Anonymously" ? "anonymous" : "withName"
          )
        }
      >
        <MaterialIcons
          name={value ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={value ? "#800000" : "gray"}
        />
        <Text style={styles.checkboxLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const ImprovementButton = ({ label }) => {
    const isSelected = selectedImprovements.includes(label);
    return (
      <TouchableOpacity
        style={[
          styles.improvementButton,
          isSelected && styles.improvementButtonSelected,
        ]}
        onPress={() => handleImprovementSelect(label)}
      >
        <Text
          style={[
            styles.improvementButtonText,
            isSelected && styles.improvementButtonTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleConfirm = () => {
    closeModal();
    handleSubmitFeedback();
  };

  const handleSubmitFeedback = async () => {
    try {
      const formData = {
        name: name,
        rate: rating,
        improvement: selectedImprovements,
        feedback: feedbackText,
        feedbackSenderId: user_id,
      };
      await axios.post("/user/feedback", formData);

      resetFormData();
      showThankYouScreen();
    } catch (error) {
      console.error(error);
      alert("Error: " + error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Rate Your Experience</Text>
      <Text style={styles.subHeaderText}>
        Are you satisfied with our service?
      </Text>

      <StarRating
        rating={rating}
        onChange={setRating}
        color="#800000"
        starSize={width * 0.1}
        style={styles.starRating}
      />

      <Text style={styles.improvementText}>Tell us what can be improved? </Text>

      <View style={styles.improvementContainer}>
        {improvementOptions.map((option, index) => (
          <ImprovementButton key={index} label={option} />
        ))}
      </View>

      <View style={styles.checkboxContainer}>
        <CustomCheckBox
          value={displayAnonymously}
          onValueChange={handleCheckboxChange}
          label="Display Anonymously"
        />
        <CustomCheckBox
          value={displayWithName}
          onValueChange={handleCheckboxChange}
          label="Display With Name"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tell us how we can improve..."
        placeholderTextColor="#666"
        multiline={true}
        value={feedbackText}
        onChangeText={setFeedbackText}
      />

      <TouchableOpacity style={styles.button} onPress={openModal}>
        <Text style={styles.buttonText}>Submit Feedback</Text>
      </TouchableOpacity>

      {selectedAlert && (
        <Modal
          transparent={true}
          visible={selectedAlert}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Do you want to send the Feedback?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.buttonModal}
                  onPress={handleConfirm}
                >
                  <Text style={styles.buttonmodaltext}>YES</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonModal}
                  onPress={closeModal}
                >
                  <Text style={styles.buttonmodaltext}>NO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {thankYouVisible && (
        <Animated.View
          style={[styles.thankYouContainer, { opacity: fadeAnim }]}
        >
          <MaterialIcons name="thumb-up" size={150} color="#800000" />
          <Text style={styles.thankYouText}>Thank You</Text>
          <Text style={styles.thankYouSubText}>
            Your feedback was successfully submitted
          </Text>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: "#f9f9f9",
  },
  headerText: {
    fontSize: width * 0.08,
    color: "#800000",
    fontWeight: "bold",
    textAlign: "left",
  },
  subHeaderText: {
    fontSize: width * 0.045,
    color: "#666",
    textAlign: "left",
    marginBottom: height * 0.02,
  },
  starRating: {
    alignSelf: "flex-start",
    marginBottom: height * 0.05,
  },
  improvementText: {
    fontSize: width * 0.045,
    color: "#666",
    fontWeight: "bold",
    marginBottom: height * 0.02,
  },
  improvementContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: height * 0.03,
  },
  improvementButton: {
    borderColor: "#800000",
    borderWidth: 1,
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  improvementButtonSelected: {
    backgroundColor: "#800000",
  },
  improvementButtonText: {
    color: "#800000",
    fontSize: width * 0.04,
  },
  improvementButtonTextSelected: {
    color: "white",
  },
  checkboxContainer: {
    marginBottom: height * 0.02,
  },
  checkboxRow: {
    flexDirection: "row",
    marginBottom: height * 0.01,
  },
  checkboxLabel: {
    fontSize: width * 0.04,
    marginLeft: 10,
  },
  input: {
    borderColor: "#800000",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: width * 0.04,
    marginBottom: height * 0.05,
  },
  button: {
    backgroundColor: "#800000",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: height * 0.05,
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.05,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: "center",
  },
  modalText: {
    fontSize: width * 0.05,
    marginBottom: height * 0.02,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  buttonModal: {
    backgroundColor: "#800000",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  buttonmodaltext: {
    color: "white",
    fontSize: width * 0.04,
  },
  thankYouContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  thankYouText: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: "#800000",
    marginTop: height * 0.02,
  },
  thankYouSubText: {
    fontSize: width * 0.04,
    color: "#666",
    marginTop: height * 0.01,
  },
});

export default FeedbackComponent;
