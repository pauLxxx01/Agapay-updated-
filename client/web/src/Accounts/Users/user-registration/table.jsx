import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../../variants";

import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import "../../../pages/home-page/process-report/view-report/view.scss";
import Fire from "../../../assets/emergencies/fire.png";
import Natural from "../../../assets/emergencies/natural.png";
import Biological from "../../../assets/emergencies/biological.png";
import Medical from "../../../assets/emergencies/medical.png";
import Facility from "../../../assets/emergencies/facilities.png";
import Crime from "../../../assets/emergencies/crime.png";
import { AuthContext } from "../../../context/authContext";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

const MessageTable = ({ tableFormat, filteredMessages }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, order: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentHeaderKey, setCurrentHeaderKey] = useState(null);

  const [data, setData] = useState([]);
  const [filteredUser, setFilteredUser] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [, messages, users] = useContext(AuthContext);

  console.log(filteredMessages, "filteredMessages");

  const [isModalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const handleRowClick = (data) => {
    setModalOpen(true);
    console.log("Received " + data.respond);
    console.log("Received success " + JSON.stringify(data));
    setData(data);
    const filter = users.find((user) => user.report_data.includes(data._id));
    console.log(filter);
    setFilteredUser(filter);
    // Navigate to in-progress report page
  };

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
        console.error(error); // Log the error for debugging
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchData();
  }, [filteredUser]);

  const closeModal = (e) => {
    setModalOpen(false);
  };

  // Filter change logic
  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    handleClose();
  };

  // Open dropdown menu
  const handleClick = (event, headerKey) => {
    setAnchorEl(event.currentTarget);
    setCurrentHeaderKey(headerKey);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Filter data
  const filteredResponders =
    filteredMessages?.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilters = Object.entries(filters).every(
        ([key, filterValue]) =>
          filterValue === ""
            ? true
            : (item[key]?.toString().toLowerCase() || "").includes(
                filterValue.toLowerCase()
              )
      );

      return matchesSearch && matchesFilters;
    }) || [];

  const sortedReports = [...filteredResponders].sort((a, b) => {
    const { key, order } = sortConfig;
    if (!key) return 0;
    const aValue = a[key]?.toString().toLowerCase() || "";
    const bValue = b[key]?.toString().toLowerCase() || "";
    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });

  //location
  const [locationAllowed, setLocationAllowed] = useState(true);
  const [location, setLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [travelTime, setTravelTime] = useState("");

  useEffect(() => {
    setLocation({
      lat: data.adminLat,
      lng: data.adminLong,
    });
  }, [data]);

  useEffect(() => {
    if (locationAllowed) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: defaultCenter,
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
  }, [locationAllowed, location]);
  // Pagination logic
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentUsers = sortedReports.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredResponders.length / recordsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const prePage = (e) => {
    e.preventDefault();
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const defaultCenter = {
    lat: data.lat,
    lng: data.long,
  };

  const containerStyle = {
    width: "100%",
    height: "400px",
  };
  return (
    <>
      {isModalOpen && (
        <div className="profile-modal">
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
                    ) : data.emergency.split(" ")[0].toLowerCase() ===
                      "medical" ? (
                      <img
                        src={Medical}
                        alt="Medical Emergency"
                        className="icon"
                      />
                    ) : data.emergency.split(" ")[0].toLowerCase() ===
                      "natural" ? (
                      <img
                        src={Natural}
                        alt="Natural Disaster"
                        className="icon"
                      />
                    ) : data.emergency.split(" ")[0].toLowerCase() ===
                      "biological" ? (
                      <img
                        src={Biological}
                        alt="Biological Hazard"
                        className="icon"
                      />
                    ) : data.emergency.split(" ")[0].toLowerCase() ===
                      "facility" ? (
                      <img
                        src={Facility}
                        alt="Facility Issue"
                        className="icon"
                      />
                    ) : data.emergency.split(" ")[0].toLowerCase() ===
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
                  <span>{data.emergency}</span>
                </div>
              </div>
              <div className="box box1">
                <div className="image">
                  <span>Captured of incident</span>
                  <img
                    src={`http://localhost:8080/images/${data.img}`}
                    alt={data.img}
                  />
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
                          <strong>Stundet Account: </strong>{" "}
                          {filteredUser.account_id}
                        </li>
                      )}
                      {filteredUser.phone_number && (
                        <li>
                          <strong>Phone Number: </strong>{" "}
                          {filteredUser.phone_number}
                        </li>
                      )}
                      {filteredUser.department && (
                        <li>
                          <strong>Department: </strong>{" "}
                          {filteredUser.department} Department
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
                          <strong>Secondray Number: </strong>{" "}
                          {parents.alt_phone}
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
                    <p>{data.location}</p>
                  </div>
                  <div className="locationBox">
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={defaultCenter}
                      zoom={18}
                    >
                      <Marker position={defaultCenter} />
                      {locationAllowed && <Marker position={location} />}
                      {locationAllowed && (
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

              <div className="box box4">
                <div className="message">
                  <span>Message</span>
                  <div className="textBox">
                    <p>{data.message}</p>
                  </div>
                </div>
              </div>

              <div className="box box5">
                <div className="bottonBox">
                  <button
                    className="btn-back"
                    onClick={() => navigate("/home/accounts")}
                  >
                    <ArrowBackIcon />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div>
        <div className="title-table">
          <h3>Reports</h3>
        </div>
        <table className="user-table">
          <thead>
            <tr>
              {tableFormat.map((header) => (
                <th key={header.id}>
                  {header.Label}
                  {header.KEY !== "number" && (
                    <>
                      <IconButton onClick={(e) => handleClick(e, header.KEY)}>
                        <MoreVertIcon sx={{ color: "white", fontSize: 12 }} />
                      </IconButton>
                      <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={
                          Boolean(anchorEl) && currentHeaderKey === header.KEY
                        }
                        onClose={handleClose}
                      >
                        <MenuItem
                          sx={{ fontSize: 12 }}
                          key="all-option"
                          onClick={() => handleFilterChange(header.KEY, "")}
                        >
                          All
                        </MenuItem>
                        {[
                          ...new Set(
                            filteredMessages.map(
                              (message) => message[header.KEY] || "No Data"
                            )
                          ),
                        ].map((value) => (
                          <MenuItem
                            sx={{ fontSize: 12 }}
                            key={value}
                            onClick={() =>
                              handleFilterChange(header.KEY, value)
                            }
                          >
                            {value}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={tableFormat.length}>No data</td>
              </tr>
            ) : (
              currentUsers.map((data, index) => (
                <tr
                  className="items-row clickable"
                  key={`${index}-${data._id}`}
                  onClick={() => {
                    console.log("Row clicked:", data);
                    handleRowClick(data);
                  }}
                >
                  {tableFormat.map((column, headerIndex) => {
                    const columnLabel = column.KEY.toLowerCase();
                    return (
                      <td key={`${columnLabel}-${headerIndex}`}>
                        {column.KEY === "number"
                          ? firstIndex + index + 1
                          : data[column.KEY]}
                        {column.KEY === "date" &&
                          moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                        {column.KEY === "school_year" && "Year"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="containerNav">
            <nav>
              <ul className="pagination-modal">
                {currentPage > 1 && (
                  <li className="page-items">
                    <button className="page-links" onClick={prePage}>
                      Previous
                    </button>
                  </li>
                )}
                {(() => {
                  const pageNumbers = [];
                  const maxVisiblePages = 3; // Adjust for your desired truncation window
                  const halfVisible = Math.floor(maxVisiblePages / 2);

                  let startPage = Math.max(1, currentPage - halfVisible);
                  let endPage = Math.min(totalPages, currentPage + halfVisible);

                  if (currentPage <= halfVisible) {
                    endPage = Math.min(maxVisiblePages, totalPages);
                  }
                  if (currentPage + halfVisible >= totalPages) {
                    startPage = Math.max(1, totalPages - maxVisiblePages + 1);
                  }

                  if (startPage > 1) {
                    pageNumbers.push(
                      <li key="first" className="page-items">
                        <button
                          className="page-links"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                      </li>
                    );
                    if (startPage > 2) {
                      pageNumbers.push(
                        <li
                          key="start-ellipsis"
                          className="page-items ellipsis"
                        >
                          ...
                        </li>
                      );
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(
                      <li
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`page-items ${
                          currentPage === i ? "active" : ""
                        }`}
                      >
                        <button className="page-links">{i}</button>
                      </li>
                    );
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pageNumbers.push(
                        <li key="end-ellipsis" className="page-items ellipsis">
                          ...
                        </li>
                      );
                    }
                    pageNumbers.push(
                      <li key="last" className="page-items">
                        <button
                          className="page-links"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </li>
                    );
                  }

                  return pageNumbers;
                })()}
                {currentPage < totalPages && (
                  <li className="page-items">
                    <button className="page-links" onClick={nextPage}>
                      Next
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

export default MessageTable;
