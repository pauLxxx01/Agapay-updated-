import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../variants";
import Table from "../../../components/table/table";
import { AuthContext } from "../../../context/authContext";
import { headerTableGeneral } from "../../../newData";
import "./history.scss";
import Loading from "../../../components/loading/loading";
const History = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, messages, users] = useContext(AuthContext);
  const filterStatus = "completed";
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (messages && users) {
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [messages, users]);
  if (loading) return <Loading />;

  const count = (data) => {
    return data.filter((item) => item.respond === filterStatus).length;
  }
  const responseCount = messages ? count(messages) : 0;

  if (error) return <p>{error}</p>;

  return (
    <div className="history">
      <motion.div
        variants={fadeIn("down", 0.1)}
        initial="hidden"
        whileInView={"show"}
        className="title"
      >
        {" "}
        <h1>HISTORY</h1>
      </motion.div>
      <motion.div
        variants={zoomIn(0.1)}
        initial="hidden"
        whileInView="show"
        className="count-container"
      >
        <div className="count-history">
          <span className="dataCount">{responseCount}</span>
          <span className="dataCount">Total Report Completed</span>
        </div>
      </motion.div>

      <div className="user-table">
        <Table
          messages={messages}
          users={users}
          headerTable={headerTableGeneral}
          filterStatus={filterStatus}
        />
      </div>
    </div>
  );
};

export default History;
