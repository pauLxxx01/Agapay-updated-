import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef(); // Ref to manage scroll

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, id: Date.now(), isSent: true }]); 
      setInputMessage('');
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Message</Text>
      </View>

      {/* Messages List */}
      <ScrollView style={styles.messagesContainer} ref={scrollViewRef}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.message, message.isSent ? styles.sentMessage : styles.receivedMessage]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input and Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputMessage.trim() ? styles.sendButtonActive : styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputMessage.trim()} // Disable button if there's no input
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
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#8B0000',
    width: '100%',
    height: '10%',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginTop: Platform.OS === 'android' ? 25 : 0,
    marginBottom: Platform.OS === 'android' ? 35 : 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: 'bold',
 
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sentMessage: {
    backgroundColor: '#8B0000',
    alignSelf: 'flex-end', // Align to the right
  },
  receivedMessage: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start', // Align to the left
  },
  messageText: {
    color: '#fff',
    fontSize: isSmallDevice ? 18 : 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    marginRight: 10,
    color: '#333',
  },
  sendButton: {
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#8B0000',
  },
  sendButtonDisabled: {
    backgroundColor: '#ddd',
  },
});

export default Message;