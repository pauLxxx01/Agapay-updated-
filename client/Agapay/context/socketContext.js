import React, { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./authContext"; // Import AuthContext

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [state] = useContext(AuthContext);
  const token = state.token;

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const defaultApiUrl = "http://192.168.18.57:8080";

    if (token) {
      const socketConnection = io(defaultApiUrl, {
        query: { token: token },
        transports: ["websocket"],
      });

      // Handle the connection event
      socketConnection.on("connect", () => {
        console.log("Connected to WebSocket server:", socketConnection.id);
        socketConnection.emit("register"); // Emit register event after connecting
      });

      // Handle disconnection
      socketConnection.on("disconnect", () => {
        console.log("Disconnected from WebSocket server.");
      });

      // Set the socket connection to the state
      setSocket(socketConnection);

      // Cleanup function to disconnect the socket on component unmount
      return () => {
        socketConnection.disconnect();
        console.log("Socket disconnected");
      };
    } else {
      console.log("No token provided. Not connecting to WebSocket server.");
    }
  }, [token]); // Recreate the connection if token changes

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext); // Provide access to socket instance
};
