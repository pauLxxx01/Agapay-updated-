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
import EmergencyBox from "./../../../components/emergencyBox/emergencybox";
import { emergencyType } from "../../../newData.js";
import LineChartComponent from "../../../components/barChart/chart.jsx";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [state, messages, users] = useContext(AuthContext);


  console.log("messages: ",messages);
  const { socket } = useSocket();

  const [modalOpen, setModalOpen] = useState({
    fire: false,
    natural: false,
    biological: false,
    medical: false,
    utility: false,
    crime: false,
  });

  // Define `filteredMessage` outside `findUserMessage`
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
  console.log(users);
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
             <div className="box box8">
            <LineChartComponent />
           
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
