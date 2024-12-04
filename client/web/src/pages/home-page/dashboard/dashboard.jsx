import "./dashboard.scss";
import { useEffect, useState, useMemo } from "react";
import Modal from "./modal/Modal.jsx";

import { fadeIn, zoomIn } from "../../../variants";
import Loading from "../../../components/loading/loading.jsx";

import axios from "axios";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useSocket } from "../../../socket/Socket.jsx";
import Notification from "../../../components/notification/notification.jsx";
import { ToastContainer, toast } from "react-toastify";
import alertSound from "../../../assets/mp3/alert.mp3";
const Dashboard = ({ users }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket } = useSocket();

  const [modalOpen, setModalOpen] = useState({
    fire: false,
    natural: false,
    biological: false,
    medical: false,
    utility: false,
    crime: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const messagesResponse = await axios.get(
          `http://localhost:8080/admin/auth/user/messages`
        );
        setMessages(messagesResponse.data.messages);
        setLoading(false);
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Now `filteredMessage` will work for each type
  const fireList = filteredMessage("Fire");
  const medicalList = filteredMessage("Medical");
  const naturalList = filteredMessage("Natural");
  const biologicalList = filteredMessage("Biological");
  const crimeList = filteredMessage("Crime");
  const utilityList = filteredMessage("Utility");

  const isAnyModalOpen = Object.values(modalOpen).some((isOpen) => isOpen);

  useEffect(() => {
    const toggleBodyScroll = () => {
      document.body.style.overflowY = isAnyModalOpen ? "hidden" : "auto";
    };

    toggleBodyScroll();

    // Cleanup function to reset body overflow on unmount
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

  const sendN = async () => {
    try {
      const request = {
        to: "ExponentPushToken[hdu_TNJlQLo8Cg_5-6np3p]",
        title: "ExponentPushToken",
        body: "ExponentPushToken",
  
      };
      await axios.post("push-notification", request);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
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
          {modalOpen.fire && (
            <Modal
              setOpenModal={() => handleModalClose("fire")}
              title="Fire Emergency"
              data={fireList}
              users={users}
            />
          )}
          {modalOpen.natural && (
            <Modal
              setOpenModal={() => handleModalClose("natural")}
              title="Natural Hazard"
              data={naturalList}
              users={users}
            />
          )}
          {modalOpen.biological && (
            <Modal
              setOpenModal={() => handleModalClose("biological")}
              title="Biological Hazard"
              users={users}
              data={biologicalList}
            />
          )}
          {modalOpen.medical && (
            <Modal
              setOpenModal={() => handleModalClose("medical")}
              title="Medical Assistance"
              data={medicalList}
              users={users}
            />
          )}
          {modalOpen.utility && (
            <Modal
              setOpenModal={() => handleModalClose("utility")}
              title="Utility failure"
              users={users}
              data={utilityList}
            />
          )}
          {modalOpen.crime && (
            <Modal
              setOpenModal={() => handleModalClose("crime")}
              title="Crime and Violence"
              users={users}
              data={crimeList}
            />
          )}

          <motion.div
            variants={fadeIn("down", 0.1)}
            initial="hidden"
            whileInView="show"
            className="title"
          >
            <h1>Dashboard</h1>
            <button onClick={() => sendN()}>send</button>
          </motion.div>

          <motion.div
            variants={zoomIn(0.1)}
            initial="hidden"
            whileInView="show"
            className="dashboard"
          >
            <motion.div
              className="box box1"
              onClick={() => handleModalOpen("fire")}
            >
              <span className="emergency count">{`${fireList.length}`}</span>
              <span className="emergency">Fire Emergency</span>
            </motion.div>
            <motion.div
              className="box box2"
              onClick={() => handleModalOpen("natural")}
            >
              <span className="emergency count">{`${naturalList.length}`}</span>
              <span className="emergency">Natural Hazard</span>
            </motion.div>
            <motion.div
              className="box box3"
              onClick={() => handleModalOpen("biological")}
            >
              <span className="emergency count">{`${biologicalList.length}`}</span>
              <span className="emergency">Biological Hazard</span>
            </motion.div>
            <motion.div
              className="box box4"
              onClick={() => handleModalOpen("medical")}
            >
              <span className="emergency count">{`${medicalList.length}`}</span>
              <span className="emergency">Medical Assistance</span>
            </motion.div>
            <motion.div
              className="box box5"
              onClick={() => handleModalOpen("utility")}
            >
              <span className="emergency count">{`${utilityList.length}`}</span>
              <span className="emergency">Utility failure</span>
            </motion.div>
            <motion.div
              className="box box6"
              onClick={() => handleModalOpen("crime")}
            >
              <span className="emergency count">{`${crimeList.length}`}</span>
              <span className="emergency">Crime and Violence</span>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <p style={{ color: "red" }}>Disconnected from server</p>
      )}
    </div>
  );
};

export default Dashboard;
