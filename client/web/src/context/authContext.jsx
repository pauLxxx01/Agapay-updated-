import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import axios from "axios";

import Loading from "./../components/loading/loading";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    admin: null,
    token: "",
  });

  const [messages, setMessages] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  axios.defaults.baseURL = "http://192.168.18.42:8080/admin/auth";

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
        const [usersResponse, messagesResponse] = await Promise.all([
          axios.get(`/user/getUser `),
          axios.get(`/user/messages`),
        ]);
        setUsers(usersResponse.data.users);
        setMessages(messagesResponse.data.messages);
        setLoading(false);
      } catch (error) {
        setError("Error fetching data");
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <AuthContext.Provider value={[state, setState, messages, users]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
