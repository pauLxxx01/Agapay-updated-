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

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const Message = ({ route }) => {
  const { data } = route.params;
  console.log("data from progress", data);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollViewRef = useRef(); // Ref to manage scroll

  const [room, setRoom] = useState("");

  const [sendChats, setSendChats] = useState("");
  const [chats, setChats] = useState([]);

  const { socket } = useSocket();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
    if (socket) {
      console.log("Socket initialized:", socket.connected);
      socket.on("chat", (data) => {
        console.log("data: ", data);
        setChats((prev) => [...prev, data]);
      });

      if (data) {
        setRoom(data._id);
        if (room) {
          socket.emit("join-room", room);
          console.log("Connected to room!");
        }
      }
    }
    return () => {
      if (socket) {
        socket.off("chat");
      }
    };
  }, [room, socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatResponse = await axios.get("/get-chats");
        console.log("message response: ", chatResponse.data);
        setChats(chatResponse.data.messages);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const handleSendChat = async () => {
    if (sendChats) {
      const senderId = data.senderId.toString();
      console.log(
        `Room: ${room} ~ Message: ${sendChats} ~ Sender ID: ${senderId}`
      );

      const messageData = {
        room: room,
        message: sendChats,
        senderId: senderId,
        sender: "user",
      };
      // Emit the message through the socket
      socket.emit("chat", messageData);
      console.log("Message sent via socket:", messageData);

      try {
        // Send the message to the server
        await axios.post("/send-chat", messageData);
        console.log("Message sent to server:", messageData);
      } catch (error) {
        console.error("Error sending message to server:", error);
      }
    }
    setSendChats("")
  };

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
      <ScrollView>
        {chats.map((message, index) => (
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
        ))}
      </ScrollView>

      {/* Input and Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={sendChats}
          onChangeText={(e) => setSendChats(e)}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            sendChats ? styles.sendButtonActive : styles.sendButtonDisabled,
          ]}
          onPress={handleSendChat}
          disabled={!sendChats.trim()} // Disable button if there's no input
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
