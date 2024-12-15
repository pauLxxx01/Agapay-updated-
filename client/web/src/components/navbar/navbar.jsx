import Message from "../../assets/icons/navbar/message.svg";
import Account from "../../assets/icons/navbar/account.svg";
import "./navbar.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useContext, useState } from "react";
import { useSocket } from "../../socket/Socket";
import { useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import useFilteredMessages from "../filterMessageBySender/filterMessage";
import axios from "axios";
import Loading from "../loading/loading";

const navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Initialize state with data from local storage
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 6;

  const [state, messages, users, notifCount, setNotifCount] =
    useContext(AuthContext);

  useEffect(() => {
    setLoading(true);

    // Check if the state, messages, and users are ready
    if (state && messages && users && messages.length > 0 && users.length > 0) {
      setLoading(false); // Set loading to false once everything is ready
    }
  }, [state, messages, users]); // Dependencies

  const filteredMessages = useFilteredMessages(messages, users);

  const handleDropdownClick = () => {
    localStorage.setItem("notifCount", JSON.stringify(0));
    setNotifCount(0);

    setIsOpen(!isOpen);
    setIsAccountOpen(false);
    setCurrentPage(1);
    // handleNotification();
  };

  const handleAccountDropdownClick = () => {
    setIsAccountOpen(!isAccountOpen);
    setIsOpen(false);
  };

  // Pagination logic
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredMessages.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const handleRowClick = (data) => {
    if (data.respond === "in-progress") {
      setIsOpen(false);
      console.log("Received " + data.respond);
      navigate(`/home/report/in-progress/${data.messageID}`, {
        state: { id: data },
      });
    } else if (data.respond === "pending") {
      setIsOpen(false);
      navigate(`/home/report/${data.messageID}`);
    } else {
      setIsOpen(false);
      navigate(`/home/report`);
    }
  };

  // Change page
  const nextPage = () => {
    if (currentPage * notificationsPerPage < filteredMessages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("@auth");
      // Set isVerified to false
      const isVerified = false;
      const id = state.admin._id;

      // Make the API call to update the admin's verification status
      const response = await axios.put(`/logout/admin/${id}`, {
        isVerified,
      });

      if (response.status === 200) {
        // Optionally, clear localStorage and redirect user on successful logout
        localStorage.removeItem("@auth");
        window.location.href = "/"; 
        window.location.reload();// Or use a react-router redirect if preferred
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Handle error (e.g., show an alert or message to the user)
    }
  };

  if (loading) {
    return <Loading /> 
  }

  return (
    <div className="navbar">
      <Link className="logo" to="/home/dashboard">
        <h1>AGAPAY</h1>
      </Link>
      <div className="icons">
        <div className="notification">
          <NotificationsIcon fontSize="large" onClick={handleDropdownClick} />
          {notifCount >= 1 && <span className="notifCount">{notifCount}</span>}
        </div>
        {/* Notification Dropdown */}
        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <h3>Notifications </h3>
              <span>{messages.length}</span>
            </div>
            {currentNotifications.length > 0 ? (
              currentNotifications.map((notif, index) => (
                <div
                  onClick={() => handleRowClick(notif)}
                  className="notification-item"
                  key={index}
                >
                  <div className="notification-info">
                    <div className="notification-details">
                      <h3>{notif.emergency}</h3>
                      <span>{notif.name}</span>
                      <span>{notif.account_id}</span>
                    </div>
                    <div className="notification-date">
                      <span>{notif.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No new notifications</div>
            )}
            {/* Pagination Controls */}
            <div className="pagination">
              <button onClick={prevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={nextPage}
                disabled={
                  currentPage * notificationsPerPage >=
                  messages.length - notificationsPerPage
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
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
                <Link
                  className="account-dropdown-links"
                  to="/"
                  onClick={handleLogout}
                >
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
