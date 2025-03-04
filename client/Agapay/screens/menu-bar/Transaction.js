import React, { useContext, useState } from "react";
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  Animated,
} from "react-native";
import { getFullScreenHeight } from "../../components/getFullScreen";
import axios from "axios";
import { Bar } from "react-native-progress";
import { useSocket } from "../../context/socketContext";
import ProgressBar from "./../../components/progress_bar/progressBar";
import { Picker } from "@react-native-picker/picker";
import { AuthContext } from "../../context/authContext";
import LoadingScreen from "../../components/loading/loading";

const TransactionHistory = ({ navigation }) => {
  const { socket } = useSocket();
  const [report, setReport] = useState([]);
  const [state] = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all"); // "all", "completed", "incomplete"

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/user/messages");
        response.data.messages.forEach((message) => {
          console.log(message.senderId + ": " + state.user._id);
        });

        const filteredMessages = response.data.messages.filter(
          (message) => String(message.senderId) === String(state.user._id)
        );
        console.log(filteredMessages, "filteredMessages");
        setReport(filteredMessages);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching messages: ", error);
        Alert.alert(
          "Error",
          "Unable to fetch messages. Please try again later."
        );
      }
    };

    fetchMessages();
  }, [state.user._id]);

  useEffect(() => {
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

    // Cleanup on unmount
    return () => {
      socket.off("progressUpdate");
    };
  }, [socket]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const renderItem = ({ item }) => {
    const isCompleted = item.percentage === "100";
    console.log(isCompleted);

    if (filterStatus === "completed" && !isCompleted) {
      return null;
    }
    if (filterStatus === "incomplete" && isCompleted) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.transactionButton}
        onPress={() => handlePress(item)}
      >
        <View style={styles.flag} />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>{item.emergency}</Text>

          <Text style={styles.transactionDate}>{timeAgo(item.createdAt)}</Text>
          <ProgressBar progress={item.percentage} />
        </View>
      </TouchableOpacity>
    );
  };

  const handlePress = (item) => {
    setSelectedTransaction(item);

    const detail = report.find((detail) => detail._id === item._id);
    console.log("deets: ", JSON.stringify(detail.percentage));

    setSelectedDetail(detail);

    if (detail.percentage == "100") {
      setModalVisible(true);
    } else {
      navigation.navigate("ShowProgress", {
        details: detail,
      });
    }
  };

  const filteredReports = [...report].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading) {
    return <LoadingScreen />;
  }

  console.log("selected: ", selectedTransaction);

  const imageUrl = selectedTransaction?.img
    ? `http://192.168.1.125:8080/images/${selectedTransaction.img}`
    : null;
  console.log(imageUrl);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <Picker
          selectedValue={filterStatus}
          style={styles.filterDropdown}
          onValueChange={(itemValue) => setFilterStatus(itemValue)}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Completed" value="completed" />
          <Picker.Item label="In progress" value="incomplete" />
        </Picker>
      </View>
      {report.length === 0 ? (
        <Text style={styles.noTransactionText}>No Transaction</Text>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          style={styles.transactionsContainer}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalTextContainer}>
              <Text style={styles.modalTextTitle}>
                {selectedTransaction && selectedTransaction.emergency}
              </Text>
            </View>

            <View style={styles.modalTextContainer}>
              <Image
                style={styles.imageContainer}
                source={{ uri: imageUrl }}
                contentFit='fill'
                onError={() => console.log('Error loading image')}
              />
              <View style={styles.timeAndDate}>
                <Text style={styles.modalText}>
                  {new Date(
                    selectedTransaction && selectedTransaction.createdAt
                  ).toLocaleDateString()}
                </Text>

                <Text style={styles.modalText}>
                  {new Date(
                    selectedTransaction && selectedTransaction.createdAt
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.modalTextContainer}>
              <Text style={styles.modalText}>
                Nearby: {selectedTransaction && selectedTransaction.location}
              </Text>
              <Text>
                Latitude: {selectedTransaction && selectedTransaction.lat}
              </Text>
              <Text>
                Longitude: {selectedTransaction && selectedTransaction.long}
              </Text>
            </View>

            <View style={styles.modalTextContainer}>
              <Text style={styles.modalText}>
                Responder:{" "}
                {selectedTransaction && selectedTransaction.responder}
              </Text>
              <Text>
                Latitude: {selectedTransaction && selectedTransaction.lat}
              </Text>
              <Text>
                Longitude: {selectedTransaction && selectedTransaction.long}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionHistory;

const styles = StyleSheet.create({
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
 
  },
  modalTextContainer: {
    padding: 2,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  timeAndDate: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getFullScreenHeight() * 0.025,
    marginTop: getFullScreenHeight() * 0.01,
  },
  filterLabel: {
    fontSize: getFullScreenHeight() * 0.02,
    fontWeight: "bold",
    color: "#333",
  },
  filterDropdown: {
    width: "60%",
    height: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  header: {
    backgroundColor: "#8C1515",
    padding: 15,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#8C1515",
  },
  logoSubText: {
    fontSize: 16,
    color: "#8C1515",
  },
  noTransactionText: {
    fontSize: getFullScreenHeight() * 0.025,
    color: "#888",
    textAlign: "center",
    marginTop: getFullScreenHeight() * 0.05,
  },
  transactionsContainer: {
    paddingHorizontal: getFullScreenHeight() * 0.025,
    marginVertical: getFullScreenHeight() * 0.01,
  },
  transactionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    marginBottom: getFullScreenHeight() * 0.015,
    padding: getFullScreenHeight() * 0.01,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDate: {
    fontSize: getFullScreenHeight() * 0.015,
    color: "#888",
    marginBottom: getFullScreenHeight() * 0.01,
  },
  transactionType: {
    fontSize: getFullScreenHeight() * 0.025,
    fontWeight: "bold",
    color: "maroon",
  },
  flag: {
    width: 15,
    height: "100%",
    backgroundColor: "#800000",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: getFullScreenHeight() * 0.02,
    borderRadius: 10,
    width: "80%",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 4,
  },
  modalTitle: {
    fontSize: getFullScreenHeight() * 0.03,
    fontWeight: "bold",
    textAlign: "center",
    padding: 13,
    borderBottomWidth: getFullScreenHeight() * 0.001,
    borderBottomColor: "#ddd",
  },
  modalTextTitle: {
    fontSize: getFullScreenHeight() * 0.025,
    color: "#4caf50",
    fontWeight: "bold",
  },
  modalText: {
    fontSize: getFullScreenHeight() * 0.02,
    color: "#444",
  },
  modalButton: {
    paddingVertical: getFullScreenHeight() * 0.01,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#800000",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modalBar: {
    display: "flex",
    gap: getFullScreenHeight() * 0.02,
    flexDirection: "row",
    textAlign: "center",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

// export default TransactionHistory;
