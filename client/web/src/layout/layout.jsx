import NavbarScreen from "../components-screen/navbar/navbar-screen.jsx";
import Navbar from "../components/navbar/navbar.jsx";
import Menu from "../components/menu/menu.jsx";
import Footer from "../components/footer/footer.jsx";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";
import { ToastContainer } from "react-toastify";
import Notification from "../components/notification/notification.jsx";
const Screen = () => {
  return (
    <div className="main-screen">
      <div className="background" />
      <NavbarScreen />
      <div className="container">
        <div id="home-anchor" className="container-screen">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Layout = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1100); // Adjust threshold as needed
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="main">
      <Navbar />
      <div className="container">
        <div
          className={`menuContainer ${isSmallScreen && menuOpen ? "open" : ""}`}
        >
          {isSmallScreen ? (
            <>
              <div className="btn-container">
                <div
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`menu-drawer-btn ${menuOpen ? "open" : ""}`}
                >
                  {menuOpen ? (
                    <CloseIcon fontSize="large" />
                  ) : (
                    <MenuIcon fontSize="large" />
                  )}
                </div>
              </div>
              <div className={`menuDrawer ${menuOpen ? "open" : "closed"}`}>
                <Menu/>
              </div>
            </>
          ) : (
            <Menu/>
          )}
        </div>

        <div className="contentContainer">
          <Outlet />
          <Notification />
        </div>
      </div>
      <Footer className="footer" />
    </div>
  );
};

export { Screen, Layout };
