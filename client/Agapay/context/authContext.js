import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

//context
const AuthContext = createContext();

//provider
const AuthProvider = ({ children }) => {
  //gloal state
  const [state, setState] = useState({
    user: null,
    token: "",
  });

  //default axios
  axios.defaults.baseURL = "http://192.168.18.90:8080/admin/auth";

  // initialization state of local storage
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

  return (
    <AuthContext.Provider value={[state, setState]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
