import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useSocket } from "../../../context/socketContext";
import axios from "axios";
import LoadingScreen from "../../../components/loading/loading";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const Message = ({ route }) => {
  const { data } = route.params;
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const scrollViewRef = useRef(); // Ref to manage scroll

  const [room, setRoom] = useState("");

  const { socket } = useSocket();

  useEffect(() => {
    if (data) {
      setRoom(data._id);
      console.log("Room updated!", data._id || data.id);
      
    }

    const fetchData = async () => {
      if (room) {
        setLoading(true);
        try {
          const response = await axios.get(`/chats/${room}`);
          console.log("Fetched messages:", response.data); // Check the full response structure
          const fetchedMessages = response.data?.data?.content || [];
          setMessages(fetchedMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
          setMessages([]);
        } finally {
          setLoading(false);
        }
      }
    };

  
    if (room) {
      fetchData();
    }
  }, [room, data]); // Dependencies: fetch data when room or data changes

  useEffect(() => {
    if (socket && room) {
      console.log("Socket initialized:", socket.connected);

      // Join room once room is set
      socket.emit("join-room", room);
      console.log(`Connected to room with ID: ${room}!`);

      socket.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [socket, room]);

  useEffect(() => {
    // Scroll to the end when messages are updated or loading is done
    if (scrollViewRef.current && !loading && messages.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, loading]); // Dependency on messages and loading

  const sendMessage = () => {
    // Validate inputs
    if (!room) {
      console.error("Room is undefined. Cannot send message.");
      return;
    }

    const senderId = data?.senderId?.toString() || data?.userId?.toString();
    if (!senderId) {
      console.error("Sender ID is undefined. Cannot send message.");
      return;
    }

    if (!socket) {
      console.error("Socket is not initialized. Cannot send message.");
      return;
    }

    if (!newMessage.trim()) {
      console.error("Message is empty. Cannot send message.");
      return;
    }

    // Emit the message
    socket.emit("sendMessage", {
      room: room,
      sender: senderId,
      message: newMessage,
    });

    console.log(
      `Message sent: ${newMessage}, Room: ${room}, Sender: ${senderId}`
    );
    setNewMessage(""); // Clear the input field
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Message</Text>
      </View>

      {/* Messages List */}
      <ScrollView ref={scrollViewRef}>
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message, index) => (
            <View key={`${message._id}-${index}`} style={styles.sentContainer}>
              <Text
                style={[
                  styles.message,
                  message.sender === "admin"
                    ? styles.receivedMessage
                    : styles.sentMessage,
                ]}
              >
                {message.message}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noMessagesContainer}>
            <Text style={styles.noMessagesContainer}>No messages</Text>
          </View>
        )}
      </ScrollView>

      {/* Input and Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={(e) => setNewMessage(e)}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            newMessage.trim()
              ? styles.sendButtonActive
              : styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()} // Correctly checks if the message is empty
        >
          <FontAwesome name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#8B0000",
    width: "100%",
    height: "10%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,

    marginBottom: Platform.OS === "android" ? 16 : 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: "bold",
  },
  message: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sentContainer: {
    marginHorizontal: 8,
  },
  sentMessage: {
    backgroundColor: "#8B0000",
    color: "white",
    alignSelf: "flex-end", // Align to the right
  },
  receivedMessage: {
    backgroundColor: "#E0E0E0",
    color: "#8B0000",
    alignSelf: "flex-start", // Align to the left
  },
  messageText: {
    fontSize: isSmallDevice ? 18 : 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    marginRight: 10,
    color: "#333",
  },
  sendButton: {
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#8B0000",
  },
  sendButtonDisabled: {
    backgroundColor: "#ddd",
  },
});

export default Message;
