import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../../context/authContext";
import axios from "axios";

const { width, height } = Dimensions.get("window");


const UpdateInfo = ({}) => {
  const [state] = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState([]);
  const [parentInfo, setParentInfo] = useState([]);
  const user_id = String(state.user?._id);

  const [formData, setFormData] = useState({
    phone_number: "0",
    alt_phone_number: "",
    address: "", 
    alt_address: "",
    parentName: "",
    parentPhone: "",
    parentAltPhone: "",
    parentAddress: "",
    parentAltAddress: "",
    parentRelationship: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          `/user/account/specific/${user_id}`
        );

        const user = userResponse.data.user;
        setUserInfo(user);

        const parentId = userResponse.data.user.parent;

        const parentResponse = await axios.get(
          `/user/parent/specific/${parentId}`
        );

        const parent = parentResponse.data.parent;
        setParentInfo(parent);

        setFormData((prevState) => ({
          ...prevState,
          phone_number: user.phone_number || "0",
          alt_phone_number: user.alt_phone_number || "",
          address: user.address || "",
          alt_address: user.alt_address || "",
          parentName: parent.name || "",
          parentPhone: parent.phone || "",
          parentAltPhone: parent.alt_phone || "",
          parentAddress: parent.address || "",
          parentAltAddress: parent.alt_address || "",
          parentRelationship: parent.relationship || "",
        }));
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchData();
  }, [user_id]);

  const [modalVisible, setModalVisible] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const navigation = useNavigation();

  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    setIsModified(
      JSON.stringify({ ...formData, [field]: value }) !==
        JSON.stringify(formData)
    );
  };

  const handleConfirm = async () => {
    console.log("Sending changes", formData);
    try {
      await axios.put(`/userUpdate/parentUpdate/${userInfo._id}`, formData);
      setModalVisible(false);
      navigation.navigate("Homepage");
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/updateUserInfo/header.png")}
        style={styles.headerCurve}
      ></Image>

      <View style={styles.profileSection}>
        {/* Profile Image Placeholder */}
        {/* <Image source={require('')} style={styles.avatar} /> */}
        <Icon name="user-circle-o" size={90}  style={styles.avatar} />

        {/* User Name */}
        <Text style={styles.name}>
          {userInfo?.name || "Name not available"}
        </Text>
  {/* Account ID */}
  <Text style={[styles.studentDetails, {fontWeight: "bold"}]}>
          {userInfo?.account_id || "Account ID not available"}
        </Text>
        {/* Degree */}
        <Text style={styles.studentDetails}>
          {userInfo?.degree || "Degree not specified"}
        </Text>

        {/* School Year */}
        <Text style={styles.studentDetails}>
          {userInfo?.school_year ? `${userInfo.school_year}year` : ""}
        </Text>

      
      </View>

      <ScrollView style={styles.infos}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Number:</Text>
          <View style={styles.inputWithIcon}>
            <Icon name="phone" size={20} color="#ccc" style={styles.icon} />
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={formData.phone_number}
              onChangeText={(value) => handleChange("phone_number", value)}
              placeholder="Contact Number"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Alternative Number:</Text>
          <View style={styles.inputWithIcon}>
            <Icon name="phone" size={20} color="#ccc" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={formData.alt_phone_number}
              keyboardType="phone-pad"
              onChangeText={(value) => handleChange("alt_phone_number", value)}
              placeholder="Alternative Number"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Permanent Address:</Text>
          <View style={styles.inputWithIcon}>
            <Icon
              name="map-marker"
              size={20}
              color="#ccc"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleChange("address", value)}
              placeholder="Permanent Address"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Address:</Text>
          <View style={styles.inputWithIcon}>
            <Icon
              name="map-marker"
              size={20}
              color="#ccc"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              value={formData.alt_address}
              onChangeText={(value) => handleChange("alt_address", value)}
              placeholder="Current address"
            />
          </View>
        </View>

        <View style={styles.guardianSection}>
          <Text style={styles.guardianHeader}>GUARDIAN INFORMATION: </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name:</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="user" size={20} color="#ccc" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={formData.parentName}
                onChangeText={(value) => handleChange("parentName", value)}
                placeholder="Name"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Relation:</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="heart" size={20} color="#ccc" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={formData.parentRelationship}
                onChangeText={(value) =>
                  handleChange("parentRelationship", value)
                }
                placeholder="Relation"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number:</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="phone" size={20} color="#ccc" style={styles.icon} />
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={formData.parentPhone}
                onChangeText={(value) => handleChange("parentPhone", value)}
                placeholder="Contact Number"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Alternative Number:</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="phone" size={20} color="#ccc" style={styles.icon} />
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={formData.parentAltPhone}
                onChangeText={(value) => handleChange("parentAltPhone", value)}
                placeholder="Alternative Number"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Permanent Address:</Text>
            <View style={styles.inputWithIcon}>
              <Icon
                name="map-marker"
                size={20}
                color="#ccc"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={formData.parentAddress}
                onChangeText={(value) => handleChange("parentAddress", value)}
                placeholder="Permanent Address"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Address:</Text>
            <View style={styles.inputWithIcon}>
              <Icon
                name="map-marker"
                size={20}
                color="#ccc"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={formData.parentAltAddress}
                onChangeText={(value) =>
                  handleChange("parentAltAddress", value)
                }
                placeholder="Current address"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: isModified ? "#8B0000" : "#ccc" },
          ]}
          disabled={!isModified}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Are you sure you want to save changes?
              </Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.modalButtonText}>YES</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.modalButtonText}>NO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerCurve: {
    height: height * 0.7,
    width: "100%",
    position: "absolute",
    top: -height * 0.15,
  },
  profileSection: {
    alignItems: "center",
    marginTop: height * 0.03,
  },
  avatar: {
    color: "maroon",
    backgroundColor: "white",
    borderRadius: 100,
    overflow: "hidden",
    marginBottom: 12,

  },
  name: {
    color: "black",
    fontSize: width * 0.055,
    fontWeight: "bold",
    marginVertical: height * 0.0015,
  },
  studentDetails: {
    color: "maroon",
    fontSize: width * 0.035,
    marginVertical: height * 0.001,
  },
  infos: {

    marginTop: height * 0.05,
    paddingHorizontal: width * 0.05,
  },
  inputContainer: {
    marginBottom: height * 0.015,
  },
  label: {
    fontSize: width * 0.040,
    color: "black",
    fontWeight: "bold",
    marginBottom: height * 0.005,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#F1EFEF",
    backgroundColor: "#F1EFEF",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
  },
  icon: {
    marginRight: width * 0.03,
    color: "#8B0000",
  },
  input: {
    flex: 1,
    fontSize: width * 0.045,
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
    marginBottom: height * 0.05,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: width * 0.05,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: width * 0.045,
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: height * 0.01,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: "#8B0000",
  },
  cancelButton: {
    backgroundColor: "#8B0000",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
});

export default UpdateInfo;
