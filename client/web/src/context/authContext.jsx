import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    admin: null,
    token: "",
  });

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
  }, []);

  return (
    <AuthContext.Provider value={[state, setState]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
