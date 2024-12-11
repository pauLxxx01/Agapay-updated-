import React, { useState, useMemo, useContext, useEffect } from "react";
import "./report.scss";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../variants";
import { headerTableGeneral } from "../../../newData";
import Loading from "../../../components/loading/loading";
import { AuthContext } from "../../../context/authContext";
import Table from "../../../components/table/table";


const Report = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, messages, users] = useContext(AuthContext);

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

  const all = ["pending", "in-progress"];
  const [filterStatus, setFilterStatus] = useState(all);

  const count = (data) => {
    return data.reduce(
      (acc, item) => {
        const status = item.respond.toLowerCase();
        if (status === "pending") {
          acc.total++;
          acc.pending++;
        } else if (status === "in-progress") {
          acc.total++;
          acc.inProgress++;
        }
        return acc;
      },
      { inProgress: 0, pending: 0, total: 0 }
    );
  };

  const handleUpdate = () => {

    

  }
  const responseCount = messages
    ? count(messages)
    : { inProgress: 0, pending: 0, total: 0 };

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  return (
    <div className="report">
      <motion.div
        variants={fadeIn("down", 0.1)}
        initial="hidden"
        whileInView={"show"}
        className="title"
      >
        <h1>REPORT</h1>
      </motion.div>

      <div className="containerReportCount">
        <div className="report-grid-container">
          <motion.div
            variants={zoomIn(0.1)}
            initial="hidden"
            whileInView="show"
            className="eachReport"
          >
            <div className="count-history" onClick={() => setFilterStatus(all)}>
              <span className="dataCount">{responseCount.total}</span>
              <span className="dataCount">Total Report</span>
            </div>

            <div
              className={`count-history ${
                filterStatus === "in-progress" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("in-progress")}
            >
              <span className="dataCount inProgress">
                {responseCount.inProgress}
              </span>
              <span className="dataCount">In Progress report</span>
            </div>

            <div
              className={`count-history ${
                filterStatus === "pending" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("pending")}
            >
              <span className="dataCount pending">{responseCount.pending}</span>
              <span className="dataCount">Pending report</span>
            </div>
          </motion.div>
        </div>
      </div>
      <button onClick={handleUpdate}>hi</button>

      <div className="user-table">
        <Table
          key={messages.length + users.length}
          messages={messages}
          users={users}
          headerTable={headerTableGeneral}
          filterStatus={filterStatus}
        />
      </div>
    </div>
  );
};

export default Report;
