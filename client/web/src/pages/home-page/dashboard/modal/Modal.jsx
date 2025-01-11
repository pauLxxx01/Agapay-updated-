import React, { useState } from "react";
import "./modal.scss";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../../variants";
import { headerTableGeneral } from "../../../../newData";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import Table from "../../../../components/table/table";

function Modal({ setOpenModal, title, data, users }) {
  const all = ["pending", "in-progress"];
  const [filterStatus, setFilterStatus] = useState(all);

  return (
    <div className="main-modal">
      <motion.div
        variants={zoomIn(0)}
        initial="hidden"
        whileInView={"show"}
        className="popup"
      >
        <div className="containerModal">
          <div className="button-container">
            <button onClick={() => setOpenModal(false)}>X</button>
          </div>
          <motion.div className="popup-header">
            <div className="data-container">
              <span>{data.length}</span>
              <span>{title}</span>
            </div>
          </motion.div>

          <Table
            messages={data}
            users={users}
            headerTable={headerTableGeneral}
            filterStatus={filterStatus}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default Modal;
