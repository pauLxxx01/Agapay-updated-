import Message from "../../assets/icons/navbar/message.svg";
import Account from "../../assets/icons/navbar/account.svg";
import "./navbar.scss";
import { Link, useLocation } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useState } from "react";
import { useSocket } from "../../socket/Socket";
import { useEffect } from "react";

const navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Initialize state with data from local storage
  const [notificationCount, setNotificationCount] = useState(
    () => parseInt(localStorage.getItem("notificationCount")) || 0
  );

  const [notification, setNotification] = useState([]);
  const { socket } = useSocket();

  console.log("data notif: ", notification);
  useEffect(() => {
    if (socket) {
      socket.on("report", (notif) => {
        console.log("Notification received:", notif);
        setNotificationCount((prev) => {
          const newCount = prev + 1;
          localStorage.setItem("notificationCount", newCount);
          return newCount;
        });
        setNotification([notif]);
      });
    }
  }, [socket]);


  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  const handleAccountDropdownClick = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  const handleNotification = () => {
    setNotificationCount(0);
    localStorage.setItem("notificationCount", 0);
  };
  return (
    <div className="navbar">
      <Link className="logo" to="/home/dashboard">
        <h1>AGAPAY</h1>
      </Link>
      <div className="icons">
        <div className="notification">
          <NotificationsIcon fontSize="large" onClick={handleNotification} />
          {notificationCount >= 1 ? <span>{notificationCount}</span> : null}
        </div>

        <div className="account">
          <div className="account-dropdown">
            <img
              src={Account}
              alt="account"
              className="icon account-dropdown-btn"
              onClick={handleAccountDropdownClick}
            />
            <span className="account-dropdown-btn"></span>
            {isAccountOpen && (
              <div className="account-dropdown-content">
                <Link className="account-dropdown-links" to="/profile">
                  <span className="text-dropdown">Profile</span>
                </Link>

                <Link className="account-dropdown-links" to="/">
                  <span className="text-dropdown">Log out</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default navbar;
