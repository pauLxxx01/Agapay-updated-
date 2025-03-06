import React, { useContext, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../variants";

import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import "../../pages/home-page/process-report/view-report/view.scss";
import Fire from "../../assets/emergencies/fire.png";
import Natural from "../../assets/emergencies/natural.png";
import Biological from "../../assets/emergencies/biological.png";
import Medical from "../../assets/emergencies/medical.png";
import Facility from "../../assets/emergencies/facilities.png";
import Crime from "../../assets/emergencies/crime.png";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import './viewModal.scss';
import {
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../loading/loading";

const ModalView = () => {
  const params = useParams();
  const id = params.id;
  console.log(id);

  const [, messages, users] = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(true);
  const [filteredUser, setFilteredUser] = useState(null);
  const [parents, setParents] = useState(null);
  const [location, setLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [travelTime, setTravelTime] = useState("");

  const [data, setData] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (users) {
      setLoading(true);
      // Ensure users and data are defined
      // Set to null if not found
      const filteredMessage = messages.find((message) => message._id === id);
      setData(filteredMessage);
      const filter = users.find((user) =>
        user.report_data.includes(filteredMessage._id)
      );
      setFilteredUser(filter || null);
      console.log("filtered message : ", filteredMessage);
    }
    setLoading(false);
  }, [users, id, messages]);

  useEffect(() => {
    const fetchData = async () => {
      if (!filteredUser) return; // Exit if filteredUser is null
      setLoading(true);
      try {
        const parentId = filteredUser.parent;

        const parentResponse = await axios.get(
          `/user/parent/specific/${parentId}`
        );
        console.log("parent response : ", parentResponse.data.parent);
        setParents(parentResponse.data.parent);
      } catch (error) {
        console.log(error); // Log the error for debugging
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchData();
  }, [filteredUser]);

  useEffect(() => {
    if (data) {
      setLocation({
        lat: data.adminLat,
        lng: data.adminLong,
      });
    }
  }, [data]);

  useEffect(() => {
    if (locationAllowed && window.google && window.google.maps && data) {
      // ADDED data dependency here.
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: data.lat, lng: data.long }, // Use data.lat and data.long here
          destination: location,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const duration = result.routes[0].legs[0].duration.text;
            setTravelTime(duration);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [locationAllowed, location, data]);

  const defaultCenter = {
    lat: data?.lat,
    lng: data?.long,
  };

  const containerStyle = {
    width: "100%",
    height: "400px",
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="view-modal">
      <motion.div
        variants={zoomIn(0.1)}
        initial="hidden"
        whileInView="show"
        className="view-container"
      >
        <div className="container-box">
          <div className="box box0">
            <div className="icon">
              {data && data.emergency ? (
                data.emergency.split(" ")[0].toLowerCase() === "fire" ? (
                  <img src={Fire} alt="Fire Emergency" className="icon" />
                ) : data.emergency.split(" ")[0].toLowerCase() === "medical" ? (
                  <img src={Medical} alt="Medical Emergency" className="icon" />
                ) : data.emergency.split(" ")[0].toLowerCase() === "natural" ? (
                  <img src={Natural} alt="Natural Disaster" className="icon" />
                ) : data.emergency.split(" ")[0].toLowerCase() ===
                  "biological" ? (
                  <img
                    src={Biological}
                    alt="Biological Hazard"
                    className="icon"
                  />
                ) : data.emergency.split(" ")[0].toLowerCase() ===
                  "facility" ? (
                  <img src={Facility} alt="Facility Issue" className="icon" />
                ) : data.emergency.split(" ")[0].toLowerCase() === "crime" ? (
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
              <span>{data?.emergency}</span>
            </div>
          </div>
          <div className="box box1">
            <div className="image">
              <span>Captured of incident</span>
              {data?.img && (
                <img
                  src={`http://localhost:8080/images/${data.img}`}
                  alt={data.img}
                />
              )}
            </div>
          </div>
          <div className="box box2">
            <div className="content-table">
              <div className="user">
                <span>{filteredUser?.role}</span>
                <ul>
                  {filteredUser?.name && (
                    <li>
                      <strong>Name: </strong> {filteredUser.name}
                    </li>
                  )}
                  {filteredUser?.account_id && (
                    <li>
                      <strong>Stundet Account: </strong>{" "}
                      {filteredUser.account_id}
                    </li>
                  )}
                  {filteredUser?.phone_number && (
                    <li>
                      <strong>Phone Number: </strong>{" "}
                      {filteredUser.phone_number}
                    </li>
                  )}
                  {filteredUser?.department && (
                    <li>
                      <strong>Department: </strong> {filteredUser.department}{" "}
                      Department
                    </li>
                  )}
                </ul>
              </div>
              <div className="guardian">
                <span>{parents?.relationship}</span>
                <ul>
                  {parents?.name && (
                    <li>
                      <strong>Name: </strong> {parents.name}
                    </li>
                  )}
                  {parents?.phone && (
                    <li>
                      <strong>Phone Number: </strong> {parents.phone}
                    </li>
                  )}
                  {parents?.alt_phone && (
                    <li>
                      <strong>Secondray Number: </strong> {parents.alt_phone}
                    </li>
                  )}
                  {parents?.address && (
                    <li>
                      <strong>Address: </strong> {parents.address}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          {data && (
            <div className="box box3">
              <div className="location">
                <span>Nearby</span>
                <div className="locationBox">
                  <p>{data.location}</p>
                </div>
                <div className="locationBox">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={18}
                  >
                    <Marker position={defaultCenter} />
                    {locationAllowed && location && <Marker position={location} />}
                    {locationAllowed && directions && (
                      <DirectionsRenderer directions={directions} />
                    )}
                  </GoogleMap>
                </div>
                <div className="locationBox">
                  {travelTime && (
                    <div>
                      <p>Estimated Maximum Travel Time: {travelTime}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="box box4">
            <div className="message">
              <span>Message</span>
              <div className="textBox">
                <p>{data?.message}</p>
              </div>
            </div>
          </div>
          <div className="box box5">
            <div className="bottonBox">
              <button
                className="btn-back"
                onClick={() => navigate("/home/history")}
              >
                <ArrowBackIcon />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalView;
