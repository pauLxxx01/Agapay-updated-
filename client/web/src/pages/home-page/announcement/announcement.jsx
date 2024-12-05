import React, { useEffect, useState, useContext } from "react";
import { fadeIn, zoomIn } from "../../../variants";
import { motion } from "framer-motion";
import axios from "axios";
import Loading from "../../../components/loading/loading";
import "./announcement.scss";
import { headerTableAnnounce } from "../../../newData";

import { AuthContext } from "../../../context/authContext";

const Announcement = () => {

  const [state] = useContext(AuthContext)
  
  console.log("Stored admin :", state);

  const [announce, setAnnounce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");

  const [isModalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
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
  }, []);

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

  const handleUpload = (e) => {
    e.preventDefault();

    axios.post("send-announcement", {});
  };

  return (
    <div>
      <motion.div
        variants={fadeIn("down", 0.1)}
        initial="hidden"
        whileInView="show"
        className="title"
      >
        <h1>Announcement {state.admin.name}</h1>
      </motion.div>
      <div className="announcement-container">
        {isModalOpen && (
          <motion.div
            variants={zoomIn(0.1)}
            initial="hidden"
            whileInView="show"
            className="modal"
          >
            <form onSubmit={handleUpload} className="announce-form"></form>
          </motion.div>
        )}

        <motion.div
          variants={fadeIn("up", 0.1)}
          initial="hidden"
          whileInView="show"
          className="btnAnnounce"
        >
          <div className="bnt-container">
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
