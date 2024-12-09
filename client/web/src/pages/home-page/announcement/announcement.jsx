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

const Announcement = () => {
  const [state, , , users] = useContext(AuthContext);
  console.log(users);

  const [usersToken, setUserToken] = useState(null);
  console.log(usersToken);
  const [announce, setAnnounce] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");

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
        console.log(response.data);
        setAnnounce(response.data.announcements);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
    if (users) {
      const tokens = users
        .filter((user) => user.pushToken)
        .map((user) => user.pushToken);

      console.log(tokens);
      setUserToken(tokens);
    }
  }, [users]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    // Prepare data

    setDuration(`${start} - ${end}`);
    setCreator(state.admin._id);
    console.log(`${start} - ${end}`);
    try {
      setLoading(true);

      const request = {
        to: usersToken,
        title: "New notification",
        body: `Announcement from ${department}!`,
        data: { screen: "Announcement", details: null },
      };
      await axios.post("push-notification", request);

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
    } finally {
      setLoading(false);
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
          variants={fadeIn("up", 0.1)}
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
                  key={index}
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
      </div>
    </div>
  );
};

export default Announcement;
