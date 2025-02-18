import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "../../../variants"; // Ensure this is defined correctly
import "./accounts.scss";
import Accounts from '../responder/responder.jsx';
import { AuthContext } from "../../../context/authContext.jsx";

const AccountCatagory = () => {


    const [, , , , , responder] = useContext(AuthContext);




  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Accounts");
  const dropdownRef = useRef(null);
  const options = ["Accounts", "Responders"];
  const placeholder = "Select an account";










  // Toggle dropdown open/close
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Handle option selection
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      variants={fadeIn("down", 0.1)}
      initial="hidden"
      whileInView="show"
      className="container-accounts"
    >
      <div className="title">
        <h1>{selectedOption}</h1>
      </div>
      <div className="drop-down-accounts">
        <div className="dropdown" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="dropdown-button">
            {selectedOption || placeholder}
            <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>
              &#9662;
            </span>
          </button>
          {isOpen && (
            <ul className="dropdown-menu">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <li
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="dropdown-item"
                  >
                    {option}
                  </li>
                ))
              ) : (
                <li className="dropdown-item disabled">No options available</li>
              )}
            </ul>
          )}
        </div>
      </div>
      {/* Conditional rendering of Responder component */}
      {selectedOption === "Responders" && <Accounts responder={responder} />}
    </motion.div>
  );
};

export default AccountCatagory;
