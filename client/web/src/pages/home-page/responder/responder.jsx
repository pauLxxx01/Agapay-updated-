import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/authContext";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../variants";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./responder.scss";
import { responderTable, accountsHeaderTable } from "../../../newData";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment"; // You aren't using moment - remove this import
import Loading from "../../../components/loading/loading";

const Accounts = ({ selectedOption }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, order: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentHeaderKey, setCurrentHeaderKey] = useState(null);

  const [state, , users, , , responder] = useContext(AuthContext); // Consider destructuring more descriptively

  const [selectedUser, setSelectedUser] = useState(users); //Initialize properly based on the default selectedOption
  const [tableFormat, setTableFormat] = useState(accountsHeaderTable);  //Initialize properly based on the default selectedOption
  const [navigationLink, setNavigationLink] = useState("/home/account/user/registration"); //Initialize properly based on the default selectedOption
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

    useEffect(() => {
        const initializeData = () => {
            setLoading(true);
            if (selectedOption === "responder") {
                setSelectedUser(responder);
                setTableFormat(responderTable);
                setNavigationLink("/home/responder/registration");
            } else {
                setSelectedUser(users);
                setTableFormat(accountsHeaderTable);
                setNavigationLink("/home/account/user/registration");
            }
            setLoading(false);
        };

        initializeData();
    }, [selectedOption, users, responder]); // Added users and responder to dependencies

  // Sorting logic
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Filter change logic
  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    handleClose();
  };

  // Close dropdown menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Open dropdown menu
  const handleClick = (event, headerKey) => {
    setAnchorEl(event.currentTarget);
    setCurrentHeaderKey(headerKey);
  };

  // Filter data
  const filteredResponders =
    selectedUser?.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilters = Object.entries(filters).every(
        ([key, filterValue]) =>
          filterValue === ""
            ? true
            : (item[key]?.toString().toLowerCase() || "").includes(
                filterValue.toLowerCase()
              )
      );

      return matchesSearch && matchesFilters;
    }) || [];

  // Sort data
  const sortedResponders = [...filteredResponders].sort((a, b) => {
    const { key, order } = sortConfig;
    if (!key) return 0;
    const aValue = a[key]?.toString().toLowerCase() || "";
    const bValue = b[key]?.toString().toLowerCase() || "";
    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentUsers = sortedResponders.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredResponders.length / recordsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const prePage = (e) => {
    e.preventDefault();
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div
      variants={zoomIn(0.1)}
      initial="hidden"
      whileInView="show"
      className="container-responder"
    >
      <div className="count-container">
        <div className="count-history">
          <span className="dataCount">{selectedUser?.length || 0}</span>
          <span className="dataCount">Total User Accounts</span>
        </div>
      </div>

      <div className="searchAndBtnContainer">
        <div className="btn-create-responder">
          <button
            className="btn-create"
            onClick={() => navigate(navigationLink)}
          >
            Create User
          </button>
        </div>

        <div className="searchContainer">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
          />
        </div>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            {tableFormat.map((header) => (
              <th key={header.id}>
                {header.Label}
                {header.KEY !== "number" && header.KEY !== "name" && (
                  <>
                    <IconButton onClick={(e) => handleClick(e, header.KEY)}>
                      <MoreVertIcon sx={{ color: "white", fontSize: 12 }} />
                    </IconButton>
                    <Menu
                      id="simple-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={
                        Boolean(anchorEl) && currentHeaderKey === header.KEY
                      }
                      onClose={handleClose}
                    >
                      <MenuItem
                        sx={{ fontSize: 12 }}
                        key="all-option"
                        onClick={() => handleFilterChange(header.KEY, "")}
                      >
                        All
                      </MenuItem>
                      {[
                        ...new Set(
                          filteredResponders.map(
                            (user) => user[header.KEY] || "No Data"
                          )
                        ),
                      ].map((value) => (
                        <MenuItem
                          sx={{ fontSize: 12 }}
                          key={value}
                          onClick={() => handleFilterChange(header.KEY, value)}
                        >
                          {value}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentUsers.length === 0 ? (
            <tr>
              <td colSpan={tableFormat.length}>No data</td>
            </tr>
          ) : (
            currentUsers.map((data, index) => (
              <tr
                key={`${index}-${data._id}`}
                onClick={() => console.log("Row clicked:", data)}
              >
                {tableFormat.map((column, headerIndex) => {
                  const columnLabel = column.KEY.toLowerCase();
                  return (
                    <td key={`${columnLabel}-${headerIndex}`}>
                      {column.KEY === "number"
                        ? firstIndex + index + 1
                        : data[column.KEY]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="containerNav">
          <nav>
            <ul className="pagination-modal">
              {currentPage > 1 && (
                <li className="page-items">
                  <button className="page-links" onClick={prePage}>
                    Previous
                  </button>
                </li>
              )}
              {(() => {
                const pageNumbers = [];
                const maxVisiblePages = 3; // Adjust for your desired truncation window
                const halfVisible = Math.floor(maxVisiblePages / 2);

                let startPage = Math.max(1, currentPage - halfVisible);
                let endPage = Math.min(totalPages, currentPage + halfVisible);

                if (currentPage <= halfVisible) {
                  endPage = Math.min(maxVisiblePages, totalPages);
                }
                if (currentPage + halfVisible >= totalPages) {
                  startPage = Math.max(1, totalPages - maxVisiblePages + 1);
                }

                if (startPage > 1) {
                  pageNumbers.push(
                    <li key="first" className="page-items">
                      <button
                        className="page-links"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                    </li>
                  );
                  if (startPage > 2) {
                    pageNumbers.push(
                      <li key="start-ellipsis" className="page-items ellipsis">
                        ...
                      </li>
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(
                    <li
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`page-items ${
                        currentPage === i ? "active" : ""
                      }`}
                    >
                      <button className="page-links">{i}</button>
                    </li>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pageNumbers.push(
                      <li key="end-ellipsis" className="page-items ellipsis">
                        ...
                      </li>
                    );
                  }
                  pageNumbers.push(
                    <li key="last" className="page-items">
                      <button
                        className="page-links"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </li>
                  );
                }

                return pageNumbers;
              })()}
              {currentPage < totalPages && (
                <li className="page-items">
                  <button className="page-links" onClick={nextPage}>
                    Next
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </motion.div>
  );
};

export default Accounts;
