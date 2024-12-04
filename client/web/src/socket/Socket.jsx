import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) setToken(storedToken);
  }, []);
  // Establish the socket connection when token is available
  useEffect(() => {
    if (token) {
      const newSocket = io("http://localhost:8080", {
        query: { token },
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]); 

  // Function to handle login and store the token
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
  };

  return (
    <SocketContext.Provider value={{ token, setToken: handleLogin, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
