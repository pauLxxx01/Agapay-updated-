import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import lock from "../../../assets/icons/login-icon/lock.svg";

import OTPDialog from "../../../components-screen/otp/dailog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import soundAlert from "../../../assets/mp3/notification_sound.mp3";
import {
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { motion } from "framer-motion";
import { zoomIn } from "../../../variants";

import "./login.scss";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);
  const [adminID, setAdminID] = useState("");
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(false);

  //verify
  const [verify, setVerify] = useState(null);

  // dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState(null);

  const navigate = useNavigate();

  const handleOpenDialog = async (event) => {
    setLoading(true);
    event.preventDefault(); // Prevent default form submission
  
    try {
      // Sending the login request
      const response = await axios.post("/login", { name, password });
      const { admin } = response.data; // Destructure response to get admin data
      const { _id: adminId, isVerified } = admin;
  
      // Log admin details
      console.log("Login Account:", { name, password });
      console.log("Admin ID: ", adminId);
      console.log("Verification: ", isVerified);
  
      // Store Admin ID in state and localStorage
      setAdminID(adminId);
      localStorage.setItem("adminID", adminId);
      localStorage.setItem("@auth", JSON.stringify(response.data));
  
      // Handle verification state
      setVerify(isVerified);
      setAdmin(admin);
  
      // If not verified, show verification prompt
      if (!isVerified) {
        const sound = new Audio(soundAlert);
        sound.play();
        setDialogOpen(true); // Open dialog if not verified
        toast.info("Please verify your account with the OTP sent to your email.");
      } else {
        const sound = new Audio(soundAlert);
        sound.play();
        toast.success("Login successful!");
        navigate("/home/dashboard");
      }
    } catch (error) {
      // Handle errors gracefully
      setDialogOpen(false); // Close dialog if there's an error
  
      const errorMessage = error.response?.data?.message || error.message;
      console.log("Error:", errorMessage);
      toast.error(errorMessage || "Login failed");
    } finally {
      // Set loading to false after the API request finishes (success or failure)
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleConfirmOtp = (otp) => {
    setOtpValue(otp); // Handle confirmed OTP
    console.log("OTP confirmed:", otp);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminID");
    if (storedAdminId) {
      console.log("Stored admin ID:", storedAdminId);
    }
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    if (storedUsername && storedPassword) {
      setName(storedUsername);
      setPassword(storedPassword);
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    if (checked) {
      localStorage.setItem("username", name);
      localStorage.setItem("password", password);
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
    }
  }, [checked, name, password]);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  return (
    <>
      <motion.div
        variants={zoomIn(0.1)}
        initial="hidden"
        whileInView={"show"}
        className="body-content"
      >
        <form onSubmit={handleOpenDialog}>
          <div className="title-bar">
            <img className="lock-icon" src={lock} alt="lock-icon" />
            <h1 className="login-title">LOGIN</h1>
          </div>
          <div className="content-login">
            <div className="input">
              <TextField
                type="text"
                id="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Enter username"
                variant="outlined"
                size="small"
                required
                autoComplete="username"
              />
              <br />
              <TextField
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Enter password"
                variant="outlined"
                size="small"
                required
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="checkbox">
              <FormControlLabel
                control={
                  <Checkbox
                    id="remember-me"
                    name=""
                    checked={checked}
                    onChange={handleChange}
                  />
                }
                label="Remember me"
                labelPlacement="end"
              />
            </div>

            <div className="button">
              <button className="button-login" type="submit">
                <span>LOGIN</span>
              </button>
            </div>
          </div>
        </form>
        <OTPDialog
          open={dialogOpen}
          admin={admin}
          adminID={adminID.toString()}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmOtp}
        />
        {otpValue && (
          <Typography variant="body1" style={{ marginTop: "20px" }}>
            OTP Entered: {otpValue}
          </Typography>
        )}
      </motion.div>
    </>
  );
};

export default Login;
