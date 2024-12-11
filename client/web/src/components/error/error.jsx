import React from "react";
import { motion } from "framer-motion";
import "./error.scss"; 

const Error = ({ message }) => {
  return (
    <motion.div
      className="error-container"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="error-message">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="error-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21.364 21.364l-1.415-1.415M4.222 4.222l1.415 1.415M4.222 19.778l1.415-1.415M21.364 4.636l-1.415 1.415M12 2a10 10 0 1010 10A10 10 0 0012 2z"
          />
        </svg>
        <span>{message}</span>
      </div>
    </motion.div>
  );
};

export default Error;
