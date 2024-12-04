import { useNavigate, useParams } from "react-router-dom";
import "./view.scss";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../../../variants";

//dialog
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import Fire from "../../../../assets/emergencies/fire.png";
import Natural from "../../../../assets/emergencies/natural.png";
import Biological from "../../../../assets/emergencies/biological.png";
import Medical from "../../../../assets/emergencies/medical.png";
import Utility from "../../../../assets/emergencies/facilities.png";
import Crime from "../../../../assets/emergencies/crime.png";
import Loading from "./../../../../components/loading/loading";
import { Typography } from "@mui/material";

const viewReports = () => {
  const { id } = useParams();
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  //for parent
  const [parents, setParents] = useState([]);

  //messages
  const [messages, setMessages] = useState([]);

  //error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = React.useState(false);

  const [userInfo, setUserInfo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //message
        const userMessageId = await axios.get(
          `http://localhost:8080/admin/auth/user/message/specific/${id}`
        );
        if (userMessageId.data.data.img) {
          userMessageId.data.data.img = `http://localhost:8080/images/${userMessageId.data.data.img}`;
        }
        const senderId = userMessageId.data.data.senderId;
        setMessages(userMessageId);
        console.log("message response : ", userMessageId.data.data.img);

        //user
        const userResponse = await axios.get(
          `http://localhost:8080/admin/auth/user/account/specific/${senderId}`
        );
        setUserInfo(userResponse.data.user);
        const parentId = userResponse.data.user.parent;
        setUsers(userResponse);
        console.log("user response :", userResponse);

        //parent
        const parentResponse = await axios.get(
          `http://localhost:8080/admin/auth/user/parent/specific/${parentId}`
        );
        console.log("parent response : ", parentResponse);
        setParents(parentResponse);
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
        console.error(error); // Log the error for debugging
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (id) => {
    try {
      const requestData = {
        respond: "in-progress",
        percentage: 40, 
        userId: userInfo._id, 
        id: id
      };

      const sendNotif = {
        to: `${userInfo.pushToken}`,
        title: "New Notification",
        body: "Tap to see details!",
        data: { screen: "Transaction", 
          details: null 
        },
      };

      await axios.post('push-notification', sendNotif)

      // Use template literals for the URL
      const apiEndpoint = `/user/message/update/${id}`;

      // Make the PUT request
      await axios.put(apiEndpoint, requestData);

      // Navigate after successful request
      navigate(`/home/report/in-progress/${id}`, { state: { id: userInfo } });
    } catch (error) {
      // Provide more descriptive error handling
      console.error(`Error updating message for ID ${id}:`, error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) return <Loading />;
  if (error) return <div>⚠️{error}</div>;
  if (!messages) return <div>Report not found</div>;

  return (
    <motion.div
      variants={zoomIn(0)}
      initial="hidden"
      whileInView={"show"}
      className="view-container"
    >
      <div className="message-box">
        <div className="container-box">
          <div className="box box0">
            <div className="icon">
              {messages && messages.data.data.emergency ? (
                messages.data.data.emergency.split(" ")[0].toLowerCase() ===
                "fire" ? (
                  <img src={Fire} alt="Fire Emergency" className="icon" />
                ) : messages.data.data.emergency.split(" ")[0].toLowerCase() ===
                  "medical" ? (
                  <img src={Medical} alt="Medical Emergency" className="icon" />
                ) : messages.data.data.emergency.split(" ")[0].toLowerCase() ===
                  "natural" ? (
                  <img src={Natural} alt="Natural Disaster" className="icon" />
                ) : messages.data.data.emergency.split(" ")[0].toLowerCase() ===
                  "biological" ? (
                  <img
                    src={Biological}
                    alt="Biological Hazard"
                    className="icon"
                  />
                ) : messages.data.data.emergency.split(" ")[0].toLowerCase() ===
                  "Utility" ? (
                  <img src={Utility} alt="Utility Issue" className="icon" />
                ) : messages.data.data.emergency.split(" ")[0].toLowerCase() ===
                  "crime" ? (
                  <img src={Crime} alt="Crime" className="icon" />
                ) : (
                  <span>Emergency Icon</span>
                )
              ) : (
                <span>Error rendering icon</span>
              )}
            </div>
            <div className="titles">
              <span>Report Details</span>
              <span>{messages.data.data.emergency}</span>
            </div>
          </div>
          <div className="box box1">
            <div className="image">
              <span>Captured of incident</span>
              <img src={messages.data.data.img} alt={messages.data.data.img} />
            </div>
          </div>
          <div className="box box2">
            <div className="content-table">
              <div className="user">
                <span>{users.data.user.role}</span>
                <ul>
                  {users.data.user.name && (
                    <li>
                      <strong>Name: </strong> {users.data.user.name}
                    </li>
                  )}
                  {users.data.user.userId && (
                    <li>
                      <strong>Stundet Account: </strong>{" "}
                      {users.data.user.userId}
                    </li>
                  )}
                  {users.data.user.phoneNumber && (
                    <li>
                      <strong>Phone Number: </strong>{" "}
                      {users.data.user.phoneNumber}
                    </li>
                  )}
                  {users.data.user.department && (
                    <li>
                      <strong>Department: </strong> {users.data.user.department}{" "}
                      Department
                    </li>
                  )}
                </ul>
              </div>
              <div className="guardian">
                <span>{parents.data.parent.relationship}</span>
                <ul>
                  {parents.data.parent.name && (
                    <li>
                      <strong>Name: </strong> {parents.data.parent.name}
                    </li>
                  )}
                  {parents.data.parent.phone && (
                    <li>
                      <strong>Phone Number: </strong>{" "}
                      {parents.data.parent.phone}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="box box3">
            <div className="location">
              <span>Nearby</span>
              <div className="locationBox">
                <p>{messages.data.data.location}</p>
              </div>
            </div>
          </div>

          <div className="box box4">
            <div className="message">
              <span>Message</span>
              <div className="textBox">
                <p>{messages.data.data.message}</p>
              </div>
            </div>
          </div>

          <div className="box box5">
            <div className="bottonBox">
              <Button color="primary" onClick={handleClickOpen}>
                Already reported
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleClickOpen}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
        <Dialog
          open={open}
          onClose={handleClose}
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "#f5f5f5",
              borderRadius: "10px",
              padding: "20px",
            },
          }}
        >
          <DialogTitle>
            <CheckCircleIcon
              color="primary"
              sx={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Confirmation
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Are you sure you want to proceed with this action?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleUpdate(messages.data.data._id, users)}
              size="medium"
              color="success"
              variant="contained"
              autoFocus
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default viewReports;
