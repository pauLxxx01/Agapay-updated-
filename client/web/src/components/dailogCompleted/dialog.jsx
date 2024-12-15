// Dialog.js
import React, { useState } from "react";
import "./dialog.scss";
import { motion } from "framer-motion";
import Fire from "../../assets/emergencies/fire.png";
import Natural from "../../assets/emergencies/natural.png";
import Biological from "../../assets/emergencies/biological.png";
import Medical from "../../assets/emergencies/medical.png";
import Facility from "../../assets/emergencies/facilities.png";
import Crime from "../../assets/emergencies/crime.png";
import { zoomIn } from "../../variants";


const Dialog = ({ users, messages, parents, responders, isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render if the dialog is not open

  console.log(users, responders, parents);
  return (
    <div
   
    className="dialog-overlay"
    >
      <motion.div
       variants={zoomIn(0)}
       initial='hidden'
       whileInView={"show"}
      className="dialog-box">
        <div className="header-dialog">
          <div className="icon-dialog">
            {messages && messages.emergency ? (
              messages.emergency.split(" ")[0].toLowerCase() === "fire" ? (
                <img src={Fire} alt="Fire Emergency" className="icon" />
              ) : messages.emergency.split(" ")[0].toLowerCase() ===
                "medical" ? (
                <img src={Medical} alt="Medical Emergency" className="icon" />
              ) : messages.emergency.split(" ")[0].toLowerCase() ===
                "natural" ? (
                <img src={Natural} alt="Natural Disaster" className="icon" />
              ) : messages.emergency.split(" ")[0].toLowerCase() ===
                "biological" ? (
                <img
                  src={Biological}
                  alt="Biological Hazard"
                  className="icon"
                />
              ) : messages.emergency.split(" ")[0].toLowerCase() ===
                "facility" ? (
                <img src={Facility} alt="Facility Issue" className="icon" />
              ) : messages.emergency.split(" ")[0].toLowerCase() === "crime" ? (
                <img src={Crime} alt="Crime" className="icon" />
              ) : (
                <span>Emergency Icon</span>
              )
            ) : (
              <span>Error rendering icon</span>
            )}
          </div>
          <div className="headlines-dialog">
          <h3>{messages.emergency}</h3>
          <span>Done Transaction</span>
          </div>
       
        </div>
        <div className="dialog-container">
          <div className="user-container">
            <h3 className="headTitle">{users.role}</h3>
            <p>
              <strong>Name:</strong> {users.name}
            </p>

            <p>
              <strong>Phone:</strong> {users.phone_number}
            </p>
            <p>
              <strong>Phone:</strong> {users.alt_phone_number}
            </p>
            <p>
              <strong>Permanent Address:</strong> {users.address}
            </p>
            <p>
              <strong>Present Address:</strong> {users.alt_address}
            </p>
          </div>
          <div className="parent-container">
            <h3 className="headTitle">Parent</h3>
            <p>
              <strong>Relationship:</strong> {parents.relationship}
            </p>
            <p>
              <strong>Name:</strong> {parents.name}
            </p>
            <p>
              <strong>Permanent Address:</strong> {parents.address}
            </p>
            <p>
              <strong>Present Address:</strong> {parents.alt_address}
            </p>
          </div>

          {responders.map((responder) => (
            <div className="responder">
              <h3 className="headTitle">Responder Info</h3>
              <p>
                <strong>Name:</strong> {responder.name}
              </p>

              <p>
                <strong>Account ID:</strong> {responder.account_id}
              </p>
              <p>
                <strong>Phone:</strong> {responder.phone}
              </p>
              <p>
                <strong>Role:</strong> {responder.emergency_role}
              </p>
            </div>
          ))}
        </div>
        <div className="btn-close">
          <button onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dialog;
