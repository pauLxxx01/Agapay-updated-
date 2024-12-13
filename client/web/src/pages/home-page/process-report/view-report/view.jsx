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

  const [open, setOpen] = useState(false);
  const [openAlready, setOpenAlready] = useState(false);

  const [userInfo, setUserInfo] = useState([]);

  const [infos, setInfos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //message
        const userMessageId = await axios.get(`/user/message/specific/${id}`);
        if (userMessageId.data.data.img) {
          userMessageId.data.data.img = `http://localhost:8080/images/${userMessageId.data.data.img}`;
        }
        const senderId = userMessageId.data.data.senderId;
        setMessages( userMessageId.data.data);
        console.log("message response : ", userMessageId.data.data);

        //user
        const userResponse = await axios.get(
          `/user/account/specific/${senderId}`
        );
        setUserInfo(userResponse.data.user);
        const parentId = userResponse.data.user.parent;
        setUsers(userResponse.data.user);
        console.log("user response :", userResponse.data.user);
        const user = userResponse.data.user;

        //parent
        const parentResponse = await axios.get(
          `/user/parent/specific/${parentId}`
        );
        console.log("parent response : ", parentResponse.data.parent);
        setParents(parentResponse.data.parent);
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
        console.error(error); // Log the error for debugging
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchData();
  }, [id]);

  const combinedData = {
    ...users,
    emergency: messages.emergency,
    respond: messages.respond,
    messageID: messages._id,
    report_data: Array.isArray(users.report_data)
      ? users.report_data.filter((id) => id !== messages._id)
      : [],
    createdAt: new Date(users.createdAt).toLocaleString(),
    updatedAt: new Date(messages.updatedAt).toLocaleString(),
  };
  
  console.log("combined users: " + JSON.stringify(combinedData))

  const handleUpdate = async (id) => {
    try {
      const requestData = {
        respond: "in-progress",
        percentage: 40,
        userId: userInfo._id,
        id: id,
      };

      const sendNotif = {
        to: `${userInfo.pushToken}`,
        title: "New Notification",
        body: "Tap to see details!",
        data: { screen: "Transaction", details: null },
      };

      await axios.post("/push-notification", sendNotif);

      // Use template literals for the URL
      const apiEndpoint = `/user/message/update/${id}`;

      // Make the PUT request
      await axios.put(apiEndpoint, requestData);

      // Navigate after successful request
      navigate(`/home/report/in-progress/${id}`, { state: { id: combinedData } });
    } catch (error) {
      // Provide more descriptive error handling
      console.error(`Error updating message for ID ${id}:`, error);
    }
  };
  const handleAlreadyUpdate = async (id) => {
    try {
      const requestData = {
        respond: "completed",
        percentage: 100,
        userId: userInfo._id,
        id: id,
      };

      const sendNotif = {
        to: `${userInfo.pushToken}`,
        title: "New Notification",
        body: "Transaction is already completed!",
        data: { screen: "Transaction", details: null },
      };

      await axios.post("push-notification", sendNotif);

      // Use template literals for the URL
      const apiEndpoint = `/user/message/update/${id}`;

      // Make the PUT request
      await axios.put(apiEndpoint, requestData);

      // Navigate after successful request
      navigate(`/home/report`);
    } catch (error) {
      // Provide more descriptive error handling
      console.error(`Error updating message for ID ${id}:`, error);
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickAlready = () => {
    setOpenAlready(true);
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
              {messages && messages.emergency ? (
                messages.emergency.split(" ")[0].toLowerCase() ===
                "fire" ? (
                  <img src={Fire} alt="Fire Emergency" className="icon" />
                ) : messages.emergency.split(" ")[0].toLowerCase() ===
                  "medical" ? (
                  <img src={Medical} alt="Medical Emergency" className="icon" />
                ) : messages.emergency.split(" ")[0].toLowerCase() ===
                  "natural" ? (
                  <img src={Natural} alt="Natural Disaster" className="icon" />
                ) : messages.emergency.split(" ")[0].toLowerCase() ===
                  "biological" ? (
                  <img
                    src={Biological}
                    alt="Biological Hazard"
                    className="icon"
                  />
                ) : messages.emergency.split(" ")[0].toLowerCase() ===
                  "utility" ? (
                  <img src={Utility} alt="Utility Issue" className="icon" />
                ) : messages.emergency.split(" ")[0].toLowerCase() ===
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
              <span>{messages.emergency}</span>
            </div>
          </div>
          <div className="box box1">
            <div className="image">
              <span>Captured of incident</span>
              <img src={messages.img} alt={messages.img} />
            </div>
          </div>
          <div className="box box2">
            <div className="content-table">
              <div className="user">
                <span>{users.role}</span>
                <ul>
                  {users.name && (
                    <li>
                      <strong>Name: </strong> {users.name}
                    </li>
                  )}
                  {users.userId && (
                    <li>
                      <strong>Stundet Account: </strong>{" "}
                      {users.userId}
                    </li>
                  )}
                  {users.phoneNumber && (
                    <li>
                      <strong>Phone Number: </strong>{" "}
                      {users.phoneNumber}
                    </li>
                  )}
                  {users.department && (
                    <li>
                      <strong>Department: </strong> {users.department}{" "}
                      Department
                    </li>
                  )}
                </ul>
              </div>
              <div className="guardian">
                <span>{parents.relationship}</span>
                <ul>
                  {parents.name && (
                    <li>
                      <strong>Name: </strong> {parents.name}
                    </li>
                  )}
                  {parents.phone && (
                    <li>
                      <strong>Phone Number: </strong>{" "}
                      {parents.phone}
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
                <p>{messages.location}</p>
              </div>
            </div>
          </div>

          <div className="box box4">
            <div className="message">
              <span>Message</span>
              <div className="textBox">
                <p>{messages.message}</p>
              </div>
            </div>
          </div>

          <div className="box box5">
            <div className="bottonBox">
              <Button color="primary" onClick={handleClickAlready}>
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
              onClick={() => handleUpdate(messages._id, users)}
              size="medium"
              color="success"
              variant="contained"
              autoFocus
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* already done */}
        <Dialog
          open={openAlready}
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
              Are you sure you that report is already done?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleAlreadyUpdate(messages._id, users)}
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
