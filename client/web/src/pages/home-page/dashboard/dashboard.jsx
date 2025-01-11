import "./dashboard.scss";
import { useEffect, useState, useMemo } from "react";
import Modal from "./modal/Modal.jsx";

import { fadeIn, zoomIn } from "../../../variants";
import Loading from "../../../components/loading/loading.jsx";

import axios from "axios";
import { motion } from "framer-motion";
import { useSocket } from "../../../socket/Socket.jsx";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext.jsx";
import EmergencyBox from "../../../components/emergencyBox/emergencybox";
import { emergencyType } from "../../../newData.js";
import BarChartComponent from "../../../components/barChart/chart.jsx";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 13.9513, // Default latitude
  lng: 121.6224  // Default longitude
};

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [state, messages, users] = useContext(AuthContext);
  const { socket } = useSocket();
  const [modalOpen, setModalOpen] = useState({
    fire: false,
    natural: false,
    biological: false,
    medical: false,
    utility: false,
    crime: false,
  });

  const [dmsCoordinates, setDmsCoordinates] = useState({ lat: '', lng: '' });

  const handleDmsChange = (e) => {
    const { name, value } = e.target;
    setDmsCoordinates((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDmsSubmit = async () => {
    const convertToDecimal = (dms) => {
      const [degrees, minutes, seconds] = dms.match(/\d+/g).map(Number);
      return degrees + (minutes / 60) + (seconds / 3600);
    };

    const latDecimal = convertToDecimal(dmsCoordinates.lat);
    const lngDecimal = convertToDecimal(dmsCoordinates.lng);
    const center = { lat: latDecimal, lng: lngDecimal };

    // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
    const directionsService = new google.maps.DirectionsService();

    directionsService.route({
      origin: { lat: 13.9513, lng: 121.6224 }, // Assuming origin as a fixed point (e.g., user's location)
      destination: center,
      travelMode: 'DRIVING'
    }, (result, status) => {
      if (status === 'OK') {
        setDirections(result);
      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });

    return center;
  };

  const filteredMessage = (type) => {
    const lowerCaseType = type.toLowerCase();

    return messages.filter((message) => {
      const isEmergencyTypeMatch =
        message.emergency.split(" ")[0].toLowerCase() === lowerCaseType;
      const isRespondStatusMatch = ["pending", "in-progress"].includes(
        message.respond.toLowerCase()
      );

      return isEmergencyTypeMatch && isRespondStatusMatch;
    });
  };

  const isAnyModalOpen = Object.values(modalOpen).some((isOpen) => isOpen);

  useEffect(() => {
    const toggleBodyScroll = () => {
      document.body.style.overflowY = isAnyModalOpen ? "hidden" : "auto";
    };

    toggleBodyScroll();

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isAnyModalOpen]);

  const handleModalOpen = (type) => {
    setModalOpen((prevModalOpen) => ({ ...prevModalOpen, [type]: true }));
  };

  const handleModalClose = (type) => {
    setModalOpen((prevModalOpen) => ({ ...prevModalOpen, [type]: false }));
  };

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {socket ? (
        <div
          className={`dashboard-container ${
            isAnyModalOpen ? "overflow-hidden" : ""
          }`}
        >
          {emergencyType.map(({ type, key }) => {
            const list = filteredMessage(type);
            return (
              modalOpen[key] && (
                <Modal
                  key={key}
                  setOpenModal={() => handleModalClose(key)}
                  title={`${type} Emergency`}
                  data={list}
                  users={users}
                />
              )
            );
          })}

          <motion.div
            variants={fadeIn("down", 0.1)}
            initial="hidden"
            whileInView="show"
            className="title"
          >
            <h1>Dashboard</h1>
          </motion.div>

          <motion.div
            variants={zoomIn(0.1)}
            initial="hidden"
            whileInView="show"
            className="dashboard"
          >
            {emergencyType.map(({ type, key, label }) => {
              const list = filteredMessage(type);
              return (
                <EmergencyBox
                  key={key}
                  type={label}
                  box={type}
                  count={list.length}
                  onClick={() => handleModalOpen(key)}
                />
              );
            })}
            <div className="box8">
              <BarChartComponent />
            </div>

            <div className="map-container">
              <input
                type="text"
                name="lat"
                placeholder="Latitude (DMS)"
                value={dmsCoordinates.lat}
                onChange={handleDmsChange}
              />
              <input
                type="text"
                name="lng"
                placeholder="Longitude (DMS)"
                value={dmsCoordinates.lng}
                onChange={handleDmsChange}
              />
              <button onClick={handleDmsSubmit}>Show Location</button>
              <LoadScript
                googleMapsApiKey="AIzaSyDnmtj0qCIxSlTSvc8HwMvrPDSA4u9Y_7o"
              >
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={10}
                >
                  <Marker position={center} />
                </GoogleMap>
              </LoadScript>
            </div>
          </motion.div>
        </div>
      ) : (
        <p style={{ color: "red" }}>Disconnected from server</p>
      )}
    </div>
  );
};

export default Dashboard;
