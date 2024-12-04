import React, { useState, useEffect } from "react";

import biological from "../../../assets/emergencies/biological.png";
import crime from "../../../assets/emergencies/crime.png";
import facilities from "../../../assets/emergencies/facilities.png";
import fire from "../../../assets/emergencies/fire.png";
import medical from "../../../assets/emergencies/medical.png";
import natural from "../../../assets/emergencies/natural.png";

import "./services.scss";

import { motion } from "framer-motion";
import {zoomIn} from '../../../variants';

const services = () => {
  const [isHovered, setIsHovered] = useState({
    fireEmergency: false,
    medicalEmergency: false,
    naturalEmergency: false,

    crimeEmergency: false,
    biologicalEmergency: false,
    facilitiesEmergency: false,
  });

  const handleMouseOver = (element) => {
    setIsHovered((prevIsHovered) => ({
      ...prevIsHovered,
      [element]: true,
    }));
  };

  const handleMouseOut = (element) => {
    setIsHovered((prevIsHovered) => ({
      ...prevIsHovered,
      [element]: false,
    }));
  };
  return (
    <>
      <div className="services-container">
        <motion.div
        className="description">
          <div className="agapay">
            <span>AGAPAY</span>
            <span>
              AGAPAY is a comprehensive emergency and disaster response system
              designed for both web and mobile platforms. It provides real-time
              alerts, crucial information, and resources during emergencies,
              ensuring swift and efficient response efforts.
            </span>
          </div>
          <div className="agapay-two">
            <span>EVERY PERSON MATTERS</span>
            <span>
              A comprehensive web and mobile application designed to facilitate
              efficient reporting management for response in emergency and
              disaster within the community inside the university
            </span>
          </div>
        </motion.div>
        <div className="services">
          <motion.div
             variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            onMouseOver={() => handleMouseOver("fireEmergency")}
            onMouseOut={() => handleMouseOut("fireEmergency")}
            className="box box1"
          >
            {isHovered.fireEmergency ? (
              <img className="icon" src={fire} alt="Fire Emergency" />
            ) : (
              <span>FIRE EMERGENCY</span>
            )}
            <span>
              A fire located in a rural area which is, or clearly threatens to
              be, beyond the fire control resources of the county responsible
              for suppression of the fire or the state if the fire is located on
              state lands.
            </span>
          </motion.div>
          <motion.div
            variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            onMouseOver={() => handleMouseOver("medicalEmergency")}
            onMouseOut={() => handleMouseOut("medicalEmergency")}
            className="box box2"
          >
            {isHovered.medicalEmergency ? (
              <img className="icon" src={medical} alt="Medical Emergency" />
            ) : (
              <span>MEDICAL ASSISTANCE</span>
            )}
            <span>
              Healthcare professionals who support doctors in clinics, medical
              offices, and hospitals by performing administrative and basic
              clinical tasks.
            </span>
          </motion.div>
          <motion.div
           variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            onMouseOver={() => handleMouseOver("naturalEmergency")}
            onMouseOut={() => handleMouseOut("naturalEmergency")}
            className="box box3"
          >
            {isHovered.naturalEmergency ? (
              <img className="icon" src={natural} alt="Natural Emergency" />
            ) : (
              <span>NATURAL HAZARD</span>
            )}
            <span>
              Highly harmful impact on a society or community following a
              natural hazard event, such as flooding, drought, earthquake,
              tropical cyclone, lightning, tsunami, volcanic activity, or
              wildfire.
            </span>
          </motion.div>

          <motion.div
            variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            onMouseOver={() => handleMouseOver("crimeEmergency")}
            onMouseOut={() => handleMouseOut("crimeEmergency")}
            className="box box4"
          >
            {isHovered.crimeEmergency ? (
              <img className="icon" src={crime} alt="Crime Emergency" />
            ) : (
              <span>CRIME & VIOLENCE</span>
            )}
            <span>
              Harmful acts or threats that cause injury, death, or property
              damage. Violent crimes are defined as those that involve force or
              the threat of force.
            </span>
          </motion.div>

          <motion.div
            variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            onMouseOver={() => handleMouseOver("biologicalEmergency")}
            onMouseOut={() => handleMouseOut("biologicalEmergency")}
            className="box box5"
          >
            {isHovered.biologicalEmergency ? (
              <img
                className="icon"
                src={biological}
                alt="Biological Emergency"
              />
            ) : (
              <span>BIOLOGICAL HAZARD</span>
            )}
            <span>
              Poses a threat to the health of living organisms, primarily
              humans. This could include a sample of a microorganism, virus, or
              toxin that can adversely affect human health.
            </span>
          </motion.div>
          <motion.div
             variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            onMouseOver={() => handleMouseOver("facilitiesEmergency")}
            onMouseOut={() => handleMouseOut("facilitiesEmergency")}
            className="box box6"
          >
            {isHovered.facilitiesEmergency ? (
              <img className="icon" src={facilities} alt="FACILITY Emergency" />
            ) : (
              <span>FACILITY EMERGENCY</span>
            )}
            <span>
              The disruption or loss of utility services, such as electricity,
              water, or gas, which are essential for daily life and business
              operations.
            </span>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default services;
