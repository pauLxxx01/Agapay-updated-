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

import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const isSmallDevice = getFullScreenHeight() < 375;

const ShowProgress = ({ navigation, route }) => {
  const { details } = route.params;
  console.log("Details in ShowProgress:", details);

  const [report, setReport] = useState(() => {
    if (details) {
      return [
        {
          _id: details._id,
          id: details.id,
          percentage: details.percentage,
          lat: details.lat,
          long: details.long,
          adminLat: details.adminLat ? details.adminLat : 0,
          adminLong: details.adminLong ? details.adminLong : 0,
        },
      ];
    }
    console.warn("User data is missing, initializing with defaults.");
    return [{ _id: "unknown", percentage: 0 }];
  });
  console.log("Report detials: ", report);
  const adminLong = report[0]?.adminLong;
  console.log(adminLong);
  const { socket } = useSocket();
  const [admins, setAdmins] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [sound, setSound] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [travelTime, setTravelTime] = useState(null);
  const [isReportComplete, setIsReportComplete] = useState(false); // New state variable

  const origin =
    report[0]?.adminLat && report[0]?.adminLong
      ? {
          latitude: report[0]?.adminLat,
          longitude: report[0]?.adminLong,
        }
      : { latitude: 0, longitude: 0 };

  // Provide default values
  const destination = report
    ? {
        latitude: report[0]?.lat,
        longitude: report[0]?.long,
      }
    : { latitude: 0, longitude: 0 }; //Provide default values

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      console.log(report);
      const percentage = String(report[0]?.percentage);
      console.log("percentage: ", percentage);
      try {
        // Match current progress
        const matchInfos = progressReportInformation.find(
          (info) => String(info.percentage) === percentage
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
          console.log("update message ", message.messages);
          setReport((prevReports) => {
            const reportExist = prevReports.some(
              (rpt) => rpt._id === message.messages._id
            );

            const updatedReports = reportExist
              ? prevReports.map((rpt) =>
                  rpt._id === message.messages._id ? message.messages : rpt
                )
              : [...prevReports, message.messages];

            return updatedReports;
          });

          // Check if the report is complete outside the setReport callback

          if (message.messages.percentage.toString() === "100") {
            setIsReportComplete(true);
          }
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
  }, [socket]);

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
  }, [currentMessage, fadeAnim]);

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

  const initialRegion = () => {
    if (origin && destination) {
      return {
        latitude: (origin.latitude + destination.latitude) / 2,
        longitude: (origin.longitude + destination.longitude) / 2,
        latitudeDelta: Math.abs(origin.latitude - destination.latitude) + 0.1,
        longitudeDelta:
          Math.abs(origin.longitude - destination.longitude) + 0.1,
      };
    } else if (origin) {
      return {
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    } else if (destination) {
      return {
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    } else {
      return {
        // Default region if no coordinates are available
        latitude: 0,
        longitude: 0,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };
    }
  };

  const userLocation = {
    latitude: destination.latitude,
    longitude: destination.longitude,
    latitudeDelta: 0.000992,
    longitudeDelta: 0.000992,
  };

  const mapRegion = initialRegion();

  const handleCompletionClose = () => {
    setIsReportComplete(false);
    navigation.navigate("Homepage");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Donut initialPercentage={report[0]?.percentage || 0} />
        <View style={styles.progressTextContainer}>
          <Text style={styles.title}>Progress Report</Text>
          {report.length > 0 && (
            <Text style={styles.subtitle}>
              Current Progress: {parseInt(report[0]?.percentage || 0)}%
            </Text>
          )}
        </View>
      </View>
      <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
        <View style={styles.dot} />
        <Text style={styles.messageText}>{currentMessage}</Text>
      </Animated.View>

      <MapView
        style={styles.map}
        initialRegion={origin ? userLocation : mapRegion}
      >
        {origin && <Marker coordinate={origin} title="Origin" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {origin != null &&
          destination != null &&
          destination != 0 &&
          origin != 0 && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={"AIzaSyDPXRC1SW_v5gq5cLZxGSXC53BjSXiddJg"}
              strokeWidth={4}
              strokeColor="blue"
              onReady={(result) => {
                console.log(
                  `Estimated travel time: ${result.duration} minutes`
                );
                setTravelTime(result.duration);
              }}
              onError={(errorMessage) => {
                console.log("GOT AN ERROR", errorMessage);
              }}
            />
          )}
      </MapView>
      {travelTime !== null && (
        <Text style={styles.travelTimeText}>
          Estimated Travel Time:
          <Text style={{ fontWeight: "bold" }}>
            {" "}
            {Math.round(travelTime)} minutes
          </Text>
        </Text>
      )}
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
            size={isSmallDevice ? 18 : 24}
            color="#FFF"
          />
        </TouchableOpacity>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.floatingButton} onPress={openCall}>
          <FontAwesome
            name="phone"
            size={isSmallDevice ? 18 : 24}
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

      {/* Report Completion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReportComplete}
        onRequestClose={handleCompletionClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Complete!</Text>
            <Text style={styles.modalText}>
              Thank you for using our application! Your report is now complete.
              Explore more features anytime.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCompletionClose}
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
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  travelTimeText: {
    color: "maroon",
  },
  progressContainer: {
    position: "absolute",
    top: 60,
    flexDirection: "row",
    width: "100%",
    gap: 12,
    backgroundColor: "maroon",
    padding: 4,
    borderRadius: 12,
  },
  progressTextContainer: {
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: "#FAA0A0",
  },
  map: {
    width: "100%",
    height: "35%",
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
    height: 55,
    width: 55,
    padding: 8,
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
    textAlign: "center",
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
    color: "#FFF",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    maxWidth: "100%",
    gap: 12,
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
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default ShowProgress;
