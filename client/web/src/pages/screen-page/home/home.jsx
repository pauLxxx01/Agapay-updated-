import React from "react";
import Agapay from "../../../assets/icons/logo/Agapay icon.svg";

import user from "../../../assets/specification/user.png";
import strong from "../../../assets/specification/strong.png";
import realtime from "../../../assets/specification/real-time.png";
import geolocation from "../../../assets/specification/geolocation.png";
import testAndprove from "../../../assets/specification/test.png";

import Services from "../services/services.jsx";

import "./home.scss";
import { motion } from "framer-motion";

import { zoomIn } from "../../../variants.js";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <div className="main-screen-body">
        <div className="container-home">
          <motion.div
            variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            className="box box1"
          >
            <p>
              Helping others might not change the world, but it can change
              someone's perspective.
            </p>
            <a>Multiple hands get the job done faster.</a>
          </motion.div>

          <motion.div
            variants={zoomIn(0.2)}
            initial="hidden"
            whileInView={"show"}
            className="box box2"
          >
            <div className="hover">
              <img className="agapay-icon" src={Agapay} alt="agapay"></img>{" "}
              <span className="agapay-name">AGAPAY</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={zoomIn(0.2)}
          initial="hidden"
          whileInView={"show"}
          className="specification-container"
        >
          <div className="specification">
            {[
              {
                title: "User  Friendly",
                icon: user,
                description:
                  "To develop user-friendly interface that will ensure the accessibility of the application with offline functionality.",
              },
              {
                title: "Strong System",
                icon: strong,
                description:
                  "To develop a system that is resistant to cyber threats, including advanced encryption, robust firewalls, and regular security updates.",
              },
              {
                title: "Real-Time Updates",
                icon: realtime,
                description:
                  "To develop a system that can handle real-time updates and alerts with minimal latency.",
              },
              {
                title: "Geolocation",
                icon: geolocation,
                description:
                  "To develop a system that is resistant to cyber threats, including advanced encryption, robust firewalls, and regular security updates.",
              },
              {
                title: "Test & Prove",
                icon: testAndprove,
                description:
                  "To develop a system that can handle real-time updates and alerts with minimal latency.",
              },
            ].map((spec, index) => (
              <div key={index} className={`box box${index + 1}-specs`}>
                <span>{spec.title}</span>
                <img className="icon" src={spec.icon} alt={spec.icon}></img>
                <p>{spec.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Home;
