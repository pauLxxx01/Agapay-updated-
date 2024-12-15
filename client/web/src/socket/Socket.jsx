import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import Loading from "../components/loading/loading";
import Error from "../components/error/error";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("@auth");
    let getToken = JSON.parse(storedToken);
    if (storedToken) {
      setToken(getToken.token);
    } else {
      setLoading(false); // No token means no loading required
    }
  }, []);

  // Establish the socket connection when token is available
  useEffect(() => {
    if (token) {
      const newSocket = io("http://localhost:8080", {
        query: { token },
      });

      setSocket(newSocket);
      setLoading(false);

      newSocket.on("connect", () => {
        console.log("Connected to socket server");
        setError(null); 
      });
 

      return () => {
        newSocket.disconnect();
      };
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }
  return (
    <SocketContext.Provider value={{ token, socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
