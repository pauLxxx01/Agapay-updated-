import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import LoadingScreen from "../components/loading/loading";

//context
const AuthContext = createContext();

//provider
const AuthProvider = ({ children }) => {
  //gloal state
  const [state, setState] = useState({
    user: null,
    token: "",
  });

  const [loading, setLoading] = useState(true);

  const defaultApiUrl = "http://192.168.18.57:8080/admin/auth";
  axios.defaults.baseURL = defaultApiUrl;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  });

  useEffect(() => {
    const loadLocalStorageData = async () => {
      try {
        let data = await AsyncStorage.getItem("@auth");
        let loginData = JSON.parse(data);
        console.log("Full data from AsyncStorage:", data);

        setState({ user: loginData?.user, token: loginData?.token });
      } catch (error) {
        console.error("Failed to load token from storage", error);
      }
    };
    loadLocalStorageData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={[state, setState]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
