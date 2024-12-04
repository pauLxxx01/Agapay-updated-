import React from "react";
import Agapay from "../../../assets/icons/logo/Agapay icon.svg";

import user from "../../../assets/specification/user.png";
import strong from "../../../assets/specification/strong.png";
import realtime from "../../../assets/specification/real-time.png";
import geolocation from "../../../assets/specification/geolocation.png";
import testAndprove from "../../../assets/specification/test.png";

import Services from "../services/services.jsx";
import Home from "../home/home.jsx";

import { motion } from "framer-motion";

import { zoomIn } from "../../../variants.js";
import { Link } from "react-router-dom";

const screen = () => {
  return (
    <>
      <div className="homeContainer">
        <Home />
        <div id="services-anchor">
          <Services />
        </div>
      </div>
    </>
  );
};

export default screen;
