import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./menu.scss";

import DashboardIcon from "../../assets/icons/menu/dashboard.svg";
import ReportIcon from "../../assets/icons/menu/report.svg";
import HistoryIcon from "../../assets/icons/menu/history.svg";
import AnnouncementIcon from "../../assets/icons/menu/announcement.svg";
import ResponderIcon from "../../assets/icons/menu/responder.svg";

const menuItems = [
  { path: "/home/dashboard", icon: DashboardIcon, title: "Dashboard" },
  { path: "/home/report", icon: ReportIcon, title: "Report" },
  { path: "/home/history", icon: HistoryIcon, title: "History" },
  { path: "/home/announcement", icon: AnnouncementIcon, title: "Announcement" },
  { path: "/home/accounts", icon: ResponderIcon, title: "Accounts" },
];

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="menu">
      <div className="item">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`listItem ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => {
              navigate(item.path);
              window.location.reload();
            }}
          >
            <img src={item.icon} alt={`${item.title} icon`} className="icon" />
            <span className="listItemTitle">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
