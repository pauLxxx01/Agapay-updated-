import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import Agapay from "../../assets/icons/logo/Agapay icon.svg";
import "./navbar-screen.scss";

const navbarScreen = () => {
  const location = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("transparent"); // initial background color

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      setScrollPosition(currentScrollPosition);

      // Change background color after scrolling 200px
      if (currentScrollPosition > 100) {
        setBackgroundColor("white");
      } else {
        setBackgroundColor("transparent");
      }

      // Update URL when scrolling to a specific anchor link
      if (location.pathname === "/") {
        if (currentScrollPosition > 650 && currentScrollPosition < 1500) {
          window.history.pushState({}, "", "#services-anchor");
          location.hash = "#services-anchor";
        } else {
          location.hash = "#home-anchor";
          window.history.pushState({}, "", "#home-anchor");
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  return (
    <>
      <div
        className="navbar-container-screen"
        style={{ backgroundColor: backgroundColor }}
      >
        <nav className="navbar-screen">
          <HashLink smooth to="/#home-anchor" className="logo-container">

            <img className="agapay-icon" src={Agapay} alt="Agapay-icon"></img>
            <span className="name">AGAPAY</span>
          </HashLink>
          <ul className="nav-links">
            <li className={location.hash === "#home-anchor" ? "active" : ""}>
              <HashLink smooth to="/#home-anchor" className="links">
                <span>HOME </span>
              </HashLink>
            </li>
            <li
              className={location.hash === "#services-anchor" ? "active" : ""}
            >
              <HashLink smooth to="/#services-anchor" className="links">
                <span>SERVICES</span>
              </HashLink>
            </li>
            <li className={location.pathname === "/login" ? "active" : ""}>
              <Link className="links" to="/login">
               <span> LOG IN</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default navbarScreen;
