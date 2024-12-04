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
  Animated,
} from "react-native";
import { getFullScreenHeight } from "../../components/getFullScreen";
import axios from "axios";
import { Bar } from "react-native-progress";
import { useSocket } from "../../context/socketContext";
import ProgressBar from "./../../components/progress_bar/progressBar";

import { AuthContext } from "../../context/authContext";

const TransactionHistory = ({ navigation }) => {
  const { socket } = useSocket();
  const [report, setReport] = useState([]);
  const [state] = useContext(AuthContext);
 

  useEffect(() => {
    const fetchMessages = async () => {
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
      } catch (error) {
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
    const handleProgressUpdate = (data) => {
      console.log("Progress Update Received: ", data);

      setReport((prevReports) =>
        prevReports.map((reportItem) =>
          reportItem._id === data.id
            ? { ...reportItem, percentage: data.percentage }
            : reportItem
        )
      );
    };

    socket.on("progressUpdate", handleProgressUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("progressUpdate", handleProgressUpdate);
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
    console.log("detail: " + JSON.stringify(detail));
    setSelectedDetail(detail);
    navigation.navigate("ShowProgress", {
      details: detail,
    });
  };  

  return (
    <View style={styles.container}>
      {report.length === 0 ? (
        <Text style={styles.noTransactionText}>No Transaction</Text>
      ) : (
        <FlatList
          data={[...report].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )}
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
            <Text style={styles.modalTitle}>Transaction Details</Text>
            <View style={styles.modalBar}>
              <Bar
                progress={
                  selectedTransaction && selectedTransaction.percentage / 100
                }
                width={getFullScreenHeight() * 0.26}
              />
              <Text>
                {selectedTransaction && selectedTransaction.percentage}%
              </Text>
            </View>

            <Text style={styles.modalText}>
              Date:{" "}
              {new Date(
                selectedTransaction && selectedTransaction.createdAt
              ).toLocaleDateString()}
            </Text>
            <Text style={styles.modalText}>
              {selectedTransaction && selectedTransaction.emergency}
            </Text>
            <Text style={styles.modalText}>
              Time Reported:
              {new Date(
                selectedTransaction && selectedTransaction.createdAt
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
            <Text style={styles.modalText}>
              Response Started: {selectedDetail && selectedDetail.responseStart}
            </Text>
            <Text style={styles.modalText}>
              SOS Call Received:{" "}
              {selectedDetail && selectedDetail.sosCallReceived}
            </Text>
            <Text style={styles.modalText}>
              Dispatch Time: {selectedDetail && selectedDetail.dispatch}
            </Text>
            <Text style={styles.modalText}></Text>
            <Text style={styles.modalText}>
              Responder 1: {selectedDetail && selectedDetail.responder}
            </Text>
            <Text style={styles.modalText}>
              Position: {selectedDetail && selectedDetail.position}
            </Text>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
  modalTitle: {
    fontSize: getFullScreenHeight() * 0.03,
    fontWeight: "bold",
    textAlign: "center",
    padding: 13,
    borderBottomWidth: getFullScreenHeight() * 0.001,
    borderBottomColor: "#ddd",
  },
  modalText: {
    fontSize: getFullScreenHeight() * 0.02,
    color: "#444",
    marginBottom: getFullScreenHeight() * 0.01,
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

export default TransactionHistory;
