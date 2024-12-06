import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './authContext'; // Import AuthContext

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [state] = useContext(AuthContext); // Get auth state from context
  const token = state.token; // Access token from the auth context

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      // Create socket connection using the token
      const socketConnection = io("http://192.168.18.90:8080", {
        query: { token: token },
      });

      // Event listeners
      socketConnection.on("connect", () => {
        console.log("Connected to server");
      });

      socketConnection.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socketConnection.on("userConnected", (data) => {
        if (Object.keys(data).length === 0) {
          console.log("User connected with no additional data.");
        } else {
          console.log("User connected:", data);
        }
      });

      // Set the socket connection to the state
      setSocket(socketConnection);

      // Cleanup function to disconnect the socket on component unmount
      return () => {
        socketConnection.disconnect();
        console.log("Socket disconnected");
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext); // Provide access to socket instance
};
