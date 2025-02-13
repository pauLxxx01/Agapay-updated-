import { useNavigate, useParams } from "react-router-dom";
import "./view.scss";
import axios from "axios";
import  { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../../../variants";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

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
import Facility from "../../../../assets/emergencies/facilities.png";
import Crime from "../../../../assets/emergencies/crime.png";
import Loading from "./../../../../components/loading/loading";
import { Typography } from "@mui/material";
import { AuthContext } from "../../../../context/authContext";

const viewReports = () => {
  const { id } = useParams();

  const [, messages, users] = useContext(AuthContext);
  console.log("id", id)
  console.log("messages: ", messages);
  console.log("user", users);
  const navigate = useNavigate();

  //for parent
  const [parents, setParents] = useState([]);


  const filteredMessage = messages.find((msg) => msg._id === id);
  const filteredUser = users.find((user) => user.report_data.includes(id));

  console.log("filtered message: ", filteredMessage);
  console.log("filtered user: ", filteredUser);

  if (
    filteredMessage &&
    typeof filteredMessage.img === "string" &&
    filteredMessage.img
  ) {
    // Only append the base URL if it doesn't already have it
    if (!filteredMessage.img.startsWith("http://localhost:8080/images/")) {
      filteredMessage.img = `http://localhost:8080/images/${filteredMessage.img}`;
    }
  }

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
        const parentId = filteredUser.parent;

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
    ...filteredUser,
    ...filteredMessage,
  };

  console.log("combined users: " + JSON.stringify(combinedData));

  const handleUpdate = async (id, user) => {
    try {
      console.log("update with id: ", id)
      console.log("user details: ", user)
      const requestData = {
        respond: "in-progress",
        percentage: 40,
        userId: user._id,
        id: id,
      };

      const sendNotif = {
        to: `${user.pushToken}`,
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
      navigate(`/home/report/in-progress/${id}`);
    } catch (error) {
      // Provide more descriptive error handling
      console.error(`Error updating message for ID ${id}:`, error);
    }
  };
  const handleAlreadyUpdate = async (id, user) => {
    try {
      const requestData = {
        respond: "completed",
        percentage: 100,
        userId: user._id,
        id: id,
      };

      const sendNotif = {
        to: `${user.pushToken}`,
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

  const defaultCenter = {
    lat: 0,
    lng: 0
  };
  const [location, setLocation] = useState(defaultCenter);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

const containerStyle = {
  width: '100%',
  height: '400px'
}

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
              {filteredMessage && filteredMessage.emergency ? (
                filteredMessage.emergency.split(" ")[0].toLowerCase() ===
                "fire" ? (
                  <img src={Fire} alt="Fire Emergency" className="icon" />
                ) : filteredMessage.emergency.split(" ")[0].toLowerCase() ===
                  "medical" ? (
                  <img src={Medical} alt="Medical Emergency" className="icon" />
                ) : filteredMessage.emergency.split(" ")[0].toLowerCase() ===
                  "natural" ? (
                  <img src={Natural} alt="Natural Disaster" className="icon" />
                ) : filteredMessage.emergency.split(" ")[0].toLowerCase() ===
                  "biological" ? (
                  <img
                    src={Biological}
                    alt="Biological Hazard"
                    className="icon"
                  />
                ) : filteredMessage.emergency.split(" ")[0].toLowerCase() ===
                  "facility" ? (
                  <img src={Facility} alt="Facility Issue" className="icon" />
                ) : filteredMessage.emergency.split(" ")[0].toLowerCase() ===
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
              <span>{filteredMessage.emergency}</span>
            </div>
          </div>
          <div className="box box1">
            <div className="image">
              <span>Captured of incident</span>
              <img src={filteredMessage.img} alt={filteredMessage.img} />
            </div>
          </div>
          <div className="box box2">
            <div className="content-table">
              <div className="user">
                <span>{filteredUser.role}</span>
                <ul>
                  {filteredUser.name && (
                    <li>
                      <strong>Name: </strong> {filteredUser.name}
                    </li>
                  )}
                  {filteredUser.account_id && (
                    <li>
                      <strong>Stundet Account: </strong> {filteredUser.account_id}
                    </li>
                  )}
                  {filteredUser.phone_number && (
                    <li>
                      <strong>Phone Number: </strong> {filteredUser.phone_number}
                    </li>
                  )}
                  {filteredUser.department && (
                    <li>
                      <strong>Department: </strong> {filteredUser.department}{" "}
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
                      <strong>Phone Number: </strong> {parents.phone}
                    </li>
                  )}
                     {parents.alt_phone && (
                    <li>
                      <strong>Secondray Phone Number: </strong> {parents.alt_phone}
                    </li>
                  )}
                   {parents.address && (
                    <li>
                      <strong>Address: </strong> {parents.address}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* location */}
          <div className="box box3">
            <div className="location">
              <span>Nearby</span>
              <div className="locationBox">
                <p>{filteredMessage.location}</p>
              </div>
              <div className="locationBox">
              <div>
        <label>
          Latitude:
          <input type="number" name="lat" value={location.lat} onChange={handleLocationChange} />
        </label>
        <label>
          Longitude:
          <input type="number" name="lng" value={location.lng} onChange={handleLocationChange} />
        </label>
      </div>
              <LoadScript googleMapsApiKey="AIzaSyDPXRC1SW_v5gq5cLZxGSXC53BjSXiddJg">
        <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={19}>
          <Marker position={location} />
        </GoogleMap>
      </LoadScript>
              </div>
            </div>
          </div>

          <div className="box box4">
            <div className="message">
              <span>Message</span>
              <div className="textBox">
                <p>{filteredMessage.message}</p>
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
              onClick={() => handleUpdate(filteredMessage._id, filteredUser)}
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
              onClick={() => handleAlreadyUpdate(filteredMessage._id, filteredUser)}
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
