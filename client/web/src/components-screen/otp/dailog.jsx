// OTPDialog.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneIcon from "@mui/icons-material/Done";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OTPDialog = ({ open, onClose, onConfirm, adminID, admin }) => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0); // Countdown state

  const navigate = useNavigate();

  useEffect(() => {
    setIsComplete(otpValues.join("").length === 6);
  }, [otpValues]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      setSendingOtp(false); // Re-enable the button when countdown is over
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setSendingOtp(true); // Disable the button
    setCountdown(15); // Start countdown

    try {
      const response = await axios.get(
        `http://localhost:8080/admin/auth/request-otp/${adminID}`
      );
      console.log("Admin OTP sent:", response.data);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(true);
    }
  };

  const handleOtpChange = (event, index) => {
    const value = event.target.value;
    if (value.match(/^\d?$/)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      setError(false);

      if (value && index < otpValues.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = ""; // Clear the previous input as well
      setOtpValues(newOtpValues);
    }
  };

  const handleConfirmClick = async (e) => {
    e.preventDefault();
    const otp = otpValues.join("");

    const token = otp;
    console.log(token);
    if (otp.length === 6) {
      setLoading(true);
      setError(false);
      try {
        const verifyResponse = await axios.post(
          "http://localhost:8080/admin/auth/verify/request-otp",
          { token }
        );
        console.log("Admin OTP verified:", verifyResponse);
        // Check if the response indicates success
        if (verifyResponse.data.success) {
          alert("Data successfully verified!"); // Show success alert
          navigate("/home/dashboard"); // Navigate to homepage
        } else {
          alert("Verification failed. Please try again."); // Handle failure case
        }

        setLoading(false);
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setLoading(false);
        setError(true);
      }
    } else {
      alert("Please enter a valid 6-digit OTP."); // Handle invalid OTP length
    }
  };

  const handleResetClick = () => {
    setOtpValues(["", "", "", "", "", ""]);
    setError(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#f5f5f5",
          borderRadius: "15px",
          padding: "20px 30px",
          textAlign: "center",
          boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.082)",
          fontFamily: "'Roboto', sans-serif",
        },
      }}
    >
      <DialogTitle>
        <CheckCircleIcon
          color="primary"
          sx={{ marginRight: "8px", verticalAlign: "middle" }}
        />
        <Typography
          variant="h6"
          component="span"
          sx={{ verticalAlign: "middle", fontWeight: 700 }}
        >
          {success ? "Success!" : "Enter OTP"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress color="primary" />
        ) : success ? (
          <Typography color="primary" variant="h6">
            <DoneIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            Verified Successfully!
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              We have sent a verification code to your mobile number.
            </Typography>
            <Grid
              container
              spacing={1}
              alignItems="center"
              justifyContent="center"
              mt={1}
            >
              <Grid item>
                <Button
                  onClick={handleSendOtp}
                  variant="outlined"
                  color="primary"
                  disabled={sendingOtp} // Disable button while sending or during countdown
                  size="small"
                >
                  {sendingOtp && countdown > 0
                    ? `Resend OTP in ${countdown}s`
                    : "Send OTP"}
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={1} justifyContent="center" mt={1}>
              {otpValues.map((value, index) => (
                <Grid item key={index}>
                  <TextField
                    id={`otp-${index}`}
                    variant="outlined"
                    margin="dense"
                    value={value}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: "center",
                        width: "35px",
                        height: "35px",
                        padding: "0",
                        backgroundColor: "rgba(228, 228, 228, 0.8)",
                        borderRadius: "7px",
                        fontWeight: 600,
                        caretColor: "rgb(127, 129, 255)",
                      },
                    }}
                    error={error && value === ""}
                  />
                </Grid>
              ))}
            </Grid>
            {error && (
              <Typography color="error" variant="body2" mt={1}>
                Please enter a valid 6-digit OTP.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      {!loading && !success && (
        <DialogActions>
          <Button onClick={handleResetClick} size="medium" color="secondary">
            Reset
          </Button>
          <Button onClick={onClose} size="medium" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClick}
            size="medium"
            color="success"
            autoFocus
            variant="contained"
            disabled={!isComplete}
          >
            Verify
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

OTPDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  adminID: PropTypes.string.isRequired,
};

export default OTPDialog;
