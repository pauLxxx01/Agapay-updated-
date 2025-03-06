import  { useEffect, useState, useContext } from "react";
import { fadeIn, zoomIn } from "../../../variants";
import { motion } from "framer-motion";
import axios from "axios";
import Loading from "../../../components/loading/loading";
import "./announcement.scss";
import { announcementHeaderTable } from "../../../newData";

import { AuthContext } from "../../../context/authContext";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  Typography,
  MenuItem,
  Alert,
} from "@mui/material";
import { useSocket } from "../../../socket/Socket";

import MoreVertIcon from "@mui/icons-material/MoreVert";

const Announcement = () => {
  const [state, , users] = useContext(AuthContext);
  const { socket } = useSocket();
  const [usersToken, setUserToken] = useState(null);

  const [announce, setAnnounce] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState("desc");
  const recordsPerPage = 5;

  const [isModalViewOpen, setIsModalViewOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [date, setDate] = useState("");
  const [creator, setCreator] = useState("");
  const [department, setDepartment] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentHeaderKey, setCurrentHeaderKey] = useState(null);
  const [filters, setFilters] = useState({});

  const [showHiddenAnnouncements, setShowHiddenAnnouncements] = useState(false); // New State

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await axios.get("/get-announcement");

        const allAnnouncements = response.data.announcements;
        let filteredAnnouncements = allAnnouncements;

        if (!showHiddenAnnouncements) {
          filteredAnnouncements = allAnnouncements.filter(
            (announcement) =>
              !announcement.isHidden &&
              !announcement.hiddenBy.includes(state.admin._id)
          );
        } else {
          // Show only hidden announcements by the current user
          filteredAnnouncements = allAnnouncements.filter((announcement) =>
            announcement.hiddenBy.includes(state.admin._id)
          );
        }

        setAnnounce(filteredAnnouncements);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    if (socket) {
      console.log("Socket connected");
      socket.on("announcement", (data) => {
        console.log("New announcement received:", data);
        setAnnounce((prevAnnounce) => [...prevAnnounce, data]);
      });

      socket.on("hide-status", (updatedAnnounce) => {
        setAnnounce((prevAnnounce) => {
          if (updatedAnnounce.hiddenBy.includes(state.admin._id)) {
            return prevAnnounce.filter((a) => a._id !== updatedAnnounce._id);
          }
          return prevAnnounce;
        });
      });
    }

    if (users) {
      const tokens = users
        .filter((user) => user.pushToken)
        .map((user) => user.pushToken);

      setUserToken(tokens || []);
    }
    return () => {
      socket.off("hide-status");
      socket.off("announcement");
    };
  }, [users, socket, showHiddenAnnouncements, state.admin._id]);

  if (loading) {
    return <Loading />;
  }

  const handleRowClick = (data) => {
    console.log(data);
    setIsModalViewOpen(true);
    setTitle(data.title);
    setDescription(data.description);
    setStart(data.start);
    setEnd(data.end);
    setTopic(data.topic);
    setDuration(data.duration);
    setDate(data.date);
    setDepartment(data.department);
    setCreator(data.creator);
  };
  const handleUnhide = (data) => {
    // Remove the current user's ID from hiddenBy array
    data.hiddenBy = data.hiddenBy.filter((id) => id !== state.admin._id);
  };

  const handleHide = async (data) => {
    if (!data) return;

    try {
      await axios.put(`/announcement/toggle-hide/${data._id}`, {
        userId: state.admin._id,
      });

      console.log("Successfully toggle!");
    } catch (error) {
      console.error("Error toggling hide status:", error);
      Alert.alert("Error", "Failed to toggle announcement visibility.");
    }
  };
  // Close dropdown menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Open dropdown menu
  const handleClick = (event, headerKey) => {
    setAnchorEl(event.currentTarget);
    setCurrentHeaderKey(headerKey);
  };
  const filteredAnnounces =
    announce?.filter((item) => {
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

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentUsers = filteredAnnounces.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredAnnounces.length / recordsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const prePage = (e) => {
    e.preventDefault();
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    // Prepare data

    setDuration(`${start} - ${end}`);
    setCreator(state.admin._id);
    try {
      const request = {
        to: usersToken,
        title: "New notification",
        body: `Announcement from ${department}!`,
        data: { screen: "Announcement", details: null },
      };
      await axios.post("/push-notification", request);

      // Make the POST request
      await axios.post("/send-announcement", {
        title,
        description,
        date,
        department,
        duration: `${start} - ${end}`,
        topic,
        creator: state.admin._id,
      });

      // Close modals/dialogs upon success
      setModalOpen(false);
      setOpenDialog(false);
      console.log("Announcement successfully sent.");
    } catch (error) {
      console.error("Error sending announcement:", error);
    }
  };

  const handleCancel = (e) => {
    setOpenDialog(false);
  };
  const closeUpdateModal = (e) => {
    e.preventDefault();
    setIsModalViewOpen(false);
    setOpenDialog(false);
    setModalOpen(false);
  };
  const handleToConfirm = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };
  // Filter change logic
  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    handleClose();
  };

  return (
    <motion.div variants={zoomIn(0.1)} initial="hidden" whileInView="show">
      <div className="title">
        <h1>
          {showHiddenAnnouncements ? "Hidden Announcement" : "Announcement"}
        </h1>
      </div>

      <div className="announcement-container">
     

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm Navigation</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary">
              Are you sure you?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleCancel()} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpload} color="success">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <div className="count-container">
          <div className="count-history">
            <span className="dataCount">{filteredAnnounces.length}</span>
            <span className="dataCount">Total Announcements</span>
          </div>
        </div>
        <div className="btnAnnounce">
          <div className="bnt-container" onClick={() => setModalOpen(true)}>
            <span>Create announcement</span>
          </div>
        </div>
        <div className="btn-search">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search announcement"
          />
        </div>
        <div className="btnHideAndUnhide">
          <button
            className="linksHide"
            onClick={() => setShowHiddenAnnouncements(!showHiddenAnnouncements)}
          >
            <p>
              {showHiddenAnnouncements
                ? "Check Latest Announcements?"
                : "Check Hidden Announcements?"}
            </p>
          </button>
        </div>
        <table className="user-table">
          <thead>
            <tr>
              {announcementHeaderTable.map((header) => (
                <th key={header.id}>
                  {header.Label}
                  {header.KEY !== "number" && header.KEY !== "action" && (
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
                            filteredAnnounces.map(
                              (user) => user[header.KEY] || "No Data"
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
                <td colSpan={announcementHeaderTable.length}>No data</td>
              </tr>
            ) : (
              currentUsers.map((data, index) => (
                <tr
                  key={`${index}-${data._id}`}
                  onClick={() => console.log("Row clicked:", data)}
                >
                  {announcementHeaderTable.map((column, headerIndex) => {
                    const columnLabel = column.KEY.toLowerCase();
                    if (column.KEY === "action") {
                      return (
                        <td
                          key={`${columnLabel}-${headerIndex}`}
                          className="btn-action-container"
                        >
                          <button
                            className="view-btn"
                            onClick={() => handleRowClick(data)}
                          >
                            View
                          </button>
                          {data.hiddenBy.includes(state.admin._id) ? (
                            <button
                              className="unhide-btn"
                              onClick={() => handleUnhide(data)}
                            >
                              Unhide
                            </button>
                          ) : (
                            <button
                              className="hide-btn"
                              onClick={() => handleHide(data)}
                            >
                              Hide
                            </button>
                          )}
                        </td>
                      );
                    } else {
                      return (
                        <td key={`${columnLabel}-${headerIndex}`}>
                          {column.KEY === "number"
                            ? firstIndex + index + 1
                            : data[column.KEY]}
                        </td>
                      );
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <motion.div
            variants={fadeIn("right", 0.1)}
            initial="hidden"
            whileInView={"show"}
            className="containerNav"
          >
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
          </motion.div>
        )}
      </div>

      {isModalViewOpen && (
        <div className="modalContainer">
              <div className="modalCardContainer">
                <div className="modal-header">
                  <button onClick={closeUpdateModal} className="close-btn">
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <div className="info-item">
                    <h2 className="announceTitle">{title}</h2>
                  </div>
                  <div className="info-item">
                    <h3>{topic}</h3>
                    <p>{description}</p>
                  </div>

                  <div className="info-item">
                    <h3>Department:</h3>
                    <p>{department}</p>
                  </div>
                  <div className="info-item">
                    <h3>Date:</h3>
                    <p>{formatDate(date)}</p>
                  </div>

                  <div className="info-item">
                    <h3>Duration:</h3>
                    <p>{duration}</p>
                  </div>
                </div>
              </div>
              </div>
        )}

        
        {isModalOpen && (
          <div>
            <div className="modals">
              <div className="form-container-announce">
                <form className="announce-form" onSubmit={handleToConfirm}>
                  <div className="header-container">
                    <h2>Announcement</h2>
                  </div>

                  <div className="announce-container">
                    <div className="announce-info">
                      <div className="form-group-announce">
                        <input
                          placeholder="Title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group-announce">
                        <input
                          type="datetime-local"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group-announce">
                        <div className="time">
                          <label htmlFor="start">Start</label>

                          <input
                            id="start"
                            type="time"
                            value={start}
                            onChange={(e) => {
                              setStart(e.target.value);
                            }}
                            required
                          />
                          <label htmlFor="end">End</label>
                          <input
                            id="end"
                            type="time"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group-announce">
                        <input
                          placeholder="Topic"
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="role">From</label>
                        <select
                          id="role"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select department...
                          </option>
                          <option value="Health and Safety Office">
                            Health and Safety Office
                          </option>
                          <option value="Admission Office">
                            Admission Office
                          </option>
                          <option value="General Services Department">
                            General Services Department
                          </option>
                          <option value="Information & Communications Technology Department">
                            Information & Communications Technology Department
                          </option>
                          <option value="Human Resource Department">
                            Human Resource Department
                          </option>
                          <option value="Medical and Dental Services">
                            Medical and Dental Services
                          </option>
                          <option value="Office of Student Affairs & Services">
                            Office of Student Affairs & Services
                          </option>
                          <option value="Registrar's Office">
                            Registrar's Office
                          </option>
                          <option value="University Laboratories">
                            University Laboratories
                          </option>
                        </select>
                      </div>
                      <div className="form-group-announce">
                        <textarea
                          placeholder="Description..."
                          type="text"
                          className="message-input"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>{" "}
                    </div>

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeUpdateModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="update-btn">
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

    </motion.div>
  );
};

export default Announcement;
