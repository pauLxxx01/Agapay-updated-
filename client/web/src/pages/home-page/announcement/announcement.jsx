import React, { useEffect, useState, useContext } from "react";
import { fadeIn, zoomIn } from "../../../variants";
import { motion } from "framer-motion";
import axios from "axios";
import Loading from "../../../components/loading/loading";
import "./announcement.scss";
import { headerTableAnnounce } from "../../../newData";

import { AuthContext } from "../../../context/authContext";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  Typography,
} from "@mui/material";
import { useSocket } from "../../../socket/Socket";
import Table from './../../../components/table/table';

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

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await axios.get("/get-announcement");
        console.log("fetched announcement: ", response.data);
        setAnnounce(response.data.announcements);
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
    }

    if (users) {
      const tokens = users
        .filter((user) => user.pushToken)
        .map((user) => user.pushToken);

      setUserToken(tokens || []);
    }
    return () => {
      socket.off("announcement");
    };
  }, [users, socket]);

  if (loading) {
    return <Loading />;
  }

  const handleRowClick = (data) => {
    console.log(data);
  };

  const filteredAnnounces = announce
    .filter(
      (data) =>
        data.title
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        data.topic
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        data.date.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortDirection === "desc"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );


    const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentUsers = filteredAnnounces.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(
    filteredAnnounces.length / recordsPerPage
  );

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
    setOpenDialog(false);
    setModalOpen(false);
  };
  const handleToConfirm = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  return (
    <div>
      <motion.div
        variants={fadeIn("down", 0.1)}
        initial="hidden"
        whileInView="show"
        className="title"
      >
        <h1>Announcement</h1>
      </motion.div>
      <div className="announcement-container">
        {isModalOpen && (
          <motion.div
            variants={zoomIn(0.1)}
            initial="hidden"
            whileInView="show"
            className="modal"
          >
            <div className="modal">
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
          </motion.div>
        )}

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

        <motion.div
          variants={fadeIn("down", 0.1)}
          initial="hidden"
          whileInView="show"
          className="btnAnnounce"
        >
          <div className="bnt-container" onClick={() => setModalOpen(true)}>
            <span>Create announcement</span>
          </div>
        </motion.div>
        <motion.div
          variants={fadeIn("up", 0.1)}
          initial="hidden"
          whileInView="show"
          className="btn-search"
        >
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search announcement"
          />
        </motion.div>
      
        <motion.table
          variants={fadeIn("up", 0.1)}
          initial="hidden"
          whileInView="show"
          className="announce-table"
        >
          <thead>
            <tr>
              {headerTableAnnounce.map((header, index) => (
                <th
                  key={header.Label +index}
                  onClick={
                    header.Label === "ANNOUNCE CREATED"
                      ? () =>
                          setSortDirection(
                            sortDirection === "desc" ? "asc" : "desc"
                          )
                      : undefined
                  }
                  style={{
                    cursor:
                      header.Label === "ANNOUNCE CREATED"
                        ? "pointer"
                        : "default",
                  }}
                >
                  {header.Label}
                  {header.Label === "ANNOUNCE CREATED" &&
                    (sortDirection === "desc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAnnounces.length === 0 ? (
              <tr>
                <td colSpan={headerTableAnnounce.length}>
                  No announcements found
                </td>
              </tr>
            ) : (
              filteredAnnounces.map((data) => (
                <tr className="items-row" key={data._id}>
                  <td>{data.title}</td>
                  <td>{data.topic}</td>
                  <td>{formatDate(data.createdAt)}</td>
                  <td className="btn-action-container">
                    <button onClick={() => handleRowClick(data)}>Edit</button>
                    <button onClick={() => handleRowClick(data)}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </motion.table>
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
                      <li key="start-ellipsis" className="page-items ellipsis">
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
    </div>
  );
};

export default Announcement;
