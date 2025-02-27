import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import axios from "axios";

import Loading from "./../components/loading/loading";
import Error from "../components/error/error";
import { useSocket } from "../socket/Socket";
import soundAlert from "../assets/mp3/notification_sound.mp3";
import { toast } from "react-toastify";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    admin: null,
    token: "",
  });

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState(null);
  const [responder, setResponder] = useState(null);

  const [notifCount, setNotifCount] = useState(() => {
    // Retrieve from localStorage or default to 0
    const savedCount = localStorage.getItem("notifCount");
    return savedCount ? JSON.parse(savedCount) : 0;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [lastReportTime, setLastReportTime] = useState(0);
  const { socket } = useSocket();

  axios.defaults.baseURL = "http://localhost:8080/admin/auth";

  useEffect(() => {
    const loadLocalData = async () => {
      try {
        let data = localStorage.getItem("@auth");
        let loginData = JSON.parse(data);
        setState({
          admin: loginData.admin,
          token: loginData.token,
        });
      } catch (error) {
        console.log("Failed to load from storage", error);
      }
    };
    loadLocalData();

    const fetchData = async () => {
      try {
        const [usersResponse, messagesResponse, responderResponse] =
          await Promise.all([
            axios.get(`/user/getUser `),
            axios.get(`/user/messages`),
            axios.get(`/admin/responder/getResponder`),
          ]);
        setUsers(usersResponse.data.users);
        setMessages(messagesResponse.data.messages); 
        setResponder(responderResponse.data.data);
        setLoading(false);
      } catch (error) {
        setErrorMessage(error);
        setError(true);
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();

    if (socket) {
      console.log("Listening for new reports...");
      socket.on("report", (message) => {
        const now = Date.now();
        const timeSinceLastReport = now - lastReportTime;

        localStorage.setItem("notifCount", JSON.stringify(notifCount + 1));
        setNotifCount((prevNotifCount) => prevNotifCount + 1);

        console.log("New report received: ", message);
        if (timeSinceLastReport > 2000) {
          const sound = new Audio(soundAlert);
          sound.play()
          toast.success(message.messages.emergency);

          setMessages((prevMessages) => [...prevMessages, message.messages]);
          setUsers((prevUsers) => [...prevUsers, message.users]);
          setLastReportTime(now); // Update the last report time
        }
      });

      socket.on("progressUpdate", (message) => {
        console.log("Progress update received: ", message);

        setMessages((prevMessages) => {
          // Check if a message with the same _id exists
          const messageExists = prevMessages.some(
            (msg) => msg._id === message.messages._id
          );

          if (messageExists) {
            // Update the message with the same _id
            return prevMessages.map((msg) =>
              msg._id === message.messages._id ? message.messages : msg
            );
          } else {
            // Add the new message if it doesn't exist
            return [...prevMessages, message.messages];
          }
        });

        setUsers((prevUsers) => {
          // Check if a user with the same _id exists
          const userExists = prevUsers.some(
            (user) => user._id === message.users._id
          );

          if (userExists) {
            // Update the user with the same _id
            return prevUsers.map((user) =>
              user._id === message.users._id ? message.users : user
            );
          } else {
            // Add the new user if it doesn't exist
            return [...prevUsers, message.users];
          }
        });
      });

      // Cleanup on component unmount
      return () => {
        socket.off("progressUpdate");
        socket.off("report");
      };
    }
  }, [socket, lastReportTime, notifCount]);

  if (error) {
    return <Error message={errorMessage.message} />;
  }
 
  return (
    <AuthContext.Provider
      value={[state, messages, users, notifCount, setNotifCount, responder]}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
