import React from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../variants";

const EmergencyBox = ({ type, onClick, count, box  }) => {
  return (
    <motion.div
      className={`box ${box.toLowerCase()}`}
      onClick={onClick}
      variants={zoomIn(0.2)}
      initial="hidden"
      whileInView="show"
    >
      <span className="emergency count">{count}</span>
      <span className="emergency">{type}</span>
    </motion.div>
  );
};

export default EmergencyBox;
