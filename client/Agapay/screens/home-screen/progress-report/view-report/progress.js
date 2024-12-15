import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Linking,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import Donut from "./../../../../components/progress_pie/progress_pie";
import { useSocket } from "../../../../context/socketContext";
import { FontAwesome } from "@expo/vector-icons";
import { getFullScreenHeight } from "../../../../components/getFullScreen";
import axios from "axios";
import { progressReportInformation } from "../../../../infoData/data";
import { Audio } from "expo-av"; // Importing Audio from expo-av
import LoadingScreen from "../../../../components/loading/loading";

const isSmallDevice = getFullScreenHeight() < 375;

const ShowProgress = ({ navigation, route }) => {
  const { details } = route.params;
  console.log("Details in ShowProgress:", details);

  const [report, setReport] = useState(() => {
    if (details) {
      return [
        { _id: details._id, id: details.id, percentage: details.percentage },
      ];
    }
    console.warn("User data is missing, initializing with defaults.");
    return [{ _id: "unknown", percentage: 0 }];
  });

  // console.log("route passed" + JSON.stringify(route.params));
  const { socket } = useSocket();
  const [admins, setAdmins] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [sound, setSound] = useState(null);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      console.log(report);
      const percentage = String(report[0]?.percentage);  
      console.log("percentage: ", percentage);
      try {
        // Match current progress
        const matchInfos = progressReportInformation.find(
          (info) => String(info.percentage)  === percentage
        );

        console.log("match infos: ", matchInfos);

        setCurrentMessage(matchInfos?.message || "Progress underway...");

        // Fetch admin data
        const fetchAdmins = async () => {
          try {
            const adminResponse = await axios.get("/getAdmin");
            const adminData = adminResponse.data.admin;
            // console.log("Admin List:", adminData);
            setAdmins(adminData || []);
          } catch (error) {
            console.error("Error fetching admins:", error);
          }
        };

        await fetchAdmins(); // Wait for admin fetch to complete

        // Set up socket listeners
        socket.on("progressUpdate", (message) => {
          console.log("update: message ", message.messages);
          setReport((prevReports) => {
            const reportExist = prevReports.some(
              (rpt) => rpt._id === message.messages._id
            );
            if (reportExist) {
              return prevReports.map((rpt) =>
                rpt._id === message.messages._id ? message.messages : rpt
              );
            } else {
              return [...prevReports, message.messages];
            }
          });
        });

        socket.on("receiveMessage", (message) => {
          console.log("New message received: ", message);
          setUnreadCount((prevCount) => prevCount + 1);
        });
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setLoading(false); // Ensure loading is false after everything
      }
    };

    initialize();

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("receiveMessage");
      socket.off("progressUpdate");
    };
  }, [socket, report]);

  useEffect(() => {
    if (currentMessage) {
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade out to 0 opacity
        duration: 500, // Fade out duration
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          setCurrentMessage((prevMessage) => prevMessage);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 500);
      });
    }
  }, [currentMessage]);

  const openCall = async () => {
    setModalVisible(true); // Open the modal when making a call
  };

  const makeCall = async ({ number }) => {
    const url = `tel:${number}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        "Phone Call",
        "Your device doesn't support making phone calls."
      );
    }
  };
  if (loading) {
    return <LoadingScreen />;
  }

  const renderAdmin = ({ item }) => (
    <TouchableOpacity
      style={styles.adminItem}
      onPress={() => makeCall({ number: item.phoneNumber })}
    >
      <Text style={styles.adminName}>{item.name}</Text>
      <Text style={styles.adminPhone}>{item.phoneNumber}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
        <View style={styles.dot} />
        <Text style={styles.messageText}>{currentMessage}</Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <Text style={styles.title}>Progress Report</Text>
        {report.length > 0 && (
          <Text style={styles.subtitle}>
            Current Progress: {parseInt(report[0]?.percentage || 0)}%
          </Text>
        )}
      </View>
      <Donut initialPercentage={report[0]?.percentage || 0} />

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            setUnreadCount(0);
            navigation.navigate("Message", { data: details });
          }}
        >
          <FontAwesome
            name="comment"
            size={isSmallDevice ? 24 : 30}
            color="#FFF"
          />
        </TouchableOpacity>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}
  
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.floatingButton} onPress={openCall}>
          <FontAwesome
            name="phone"
            size={isSmallDevice ? 24 : 30}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin Contacts</Text>
            <FlatList
              data={admins}
              keyExtractor={(item) => item._id}
              renderItem={renderAdmin}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
  },
  floatingButtonContainer: {
    position: "absolute",
    right: 20,
    bottom: 30,
    alignItems: "center",
  },
  floatingButton: {
    backgroundColor: "#8B0000",
    borderRadius: 100,
    height: 75,
    width: 75,
    padding: 16,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  adminItem: {
    marginBottom: 10,
  },
  adminName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  adminPhone: {
    fontSize: 14,
    color: "#555",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#8B0000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#8B0000",
    marginRight: 10,
  },
  messageText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#8B0000",
    textAlign: "center",
  },
  messageContainer: {
    position: "absolute",
    top: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "100%",
    alignContent: "center",
    backgroundColor: "#FAA0A0",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: -2,
    backgroundColor: "#F7B32D",
    borderRadius: 50,
    width: isSmallDevice ? 25 : 30,
    height: isSmallDevice ? 25 : 30,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "maroon",
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default ShowProgress;
