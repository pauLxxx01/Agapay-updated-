import { motion } from "framer-motion";
import { fadeIn } from "../../variants";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./table.scss";
import DialogCompleted from "../dailogCompleted/dialog";
import Loading from "../loading/loading";
import Error from "../error/error";
import axios from "axios";
import { Alert, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ModalView from "../viewModal/viewModal";

const Table = ({ messages, users, headerTable, filterStatus }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState("desc");
  const recordsPerPage = 5;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({
    message: null,
    user: null,
    responders: [],
    parents: null,
  });

  const [parents, setParents] = useState(null);
  const [responder, setResponder] = useState(null);

  const [filters, setFilters] = useState({});
  const [selectedSort, setSelectedSort] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responderResponse = await axios.get(
          "/admin/responder/getResponder"
        );

        setResponder(responderResponse.data.data);
      } catch (error) {
        setError(error.massage);
      }
    };
    fetchData();
  }, []);

  const handleDateSortToggle = () => {
    setSortDirection((prevDirection) =>
      prevDirection === "desc" ? "asc" : "desc"
    );
  };

  const handleDateSortChange = (event) => {
    console.log(event, "event");
    setSortDirection(event);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === value ? value : "",
    }));
  };

  const handleSortToggle = (key) => {
    if (selectedSort.includes(key)) {
      setSelectedSort(selectedSort.filter((item) => item !== key));
    } else {
      setSelectedSort([...selectedSort, key]);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!messages || !users) return [];

    let filteredData = messages
      .map((data) => {
        const matchedUser = users.find(
          (user) => user._id.toString() === data.senderId.toString()
        );
        return {
          ...matchedUser,
          createdAt: data.createdAt
            ? new Date(data.createdAt).toLocaleString()
            : null,
          updatedAt: data.updatedAt
            ? new Date(data.updatedAt).toLocaleString()
            : null,
          messageID: data._id,
          respond: data.respond,
          emergency: data.emergency,
        };
      })
      .filter(
        (user) =>
          filterStatus.includes(user.respond) &&
          Object.keys(filters).every((key) =>
            filters[key] ? user[key]?.toString() === filters[key] : true
          ) &&
          (searchTerm === "" ||
            Object.values(user).some((value) =>
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            ))
      )
      .sort((a, b) =>
        sortDirection === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );

    return filteredData;
  }, [
    messages,
    users,
    searchTerm,
    filters,
    selectedSort,
    sortDirection,
    filterStatus,
  ]);

  const openDialog = async (data) => {
    console.log(data);
    const filteredMessage = messages.find((msg) => msg._id === data.messageID);
    const filteredSelectedUser = users.find((user) => user._id === data._id);
    const filteredResponder = responder.filter((res) =>
      filteredMessage.responder.includes(res._id)
    );
    const parentResponse = await axios.get(
      `/user/parent/specific/${filteredSelectedUser.parent}`
    );
    console.log("messages: ", filteredMessage);
    console.log("users: ", filteredSelectedUser);
    console.log("responders: ", filteredResponder);
    setDialogData({
      message: filteredMessage,
      user: filteredSelectedUser,
      responders: filteredResponder,
      parents: parentResponse.data.parent,
    });

    setIsDialogOpen(true);
  };

  // Filter based on selected status
  // const getFilteredUsersByStatus = () => {
  //   return filteredUsers.filter(
  //     (user) => filterStatus.includes(user.respond) && user.emergency
  //   );
  // };

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentUsers = filteredUsers.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const prePage = (e) => {
    e.preventDefault();
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleRowClick = (data) => {
    if (data.respond === "in-progress") {
      console.log("Received " + data.respond);
      console.log("Received success " + JSON.stringify(data));
      navigate(`/home/report/in-progress/${data.messageID}`, {
        state: { id: data },
      });
    } else if (data.respond === "pending") {
      navigate(`/home/report/${data.messageID}`);
    } else {
      openDialog(data);
      console.log("datas info: ", data);
    }
  };

  const closeDialog = () => setIsDialogOpen(false);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const [selectedRows, setSelectedRows] = useState([]);
  const [isChecked, setIsChecked] = useState(false);

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setIsChecked(checked);

    if (checked) {
      // const allMessageIDs = currentUsers.map((user) => user.messageID);
      // setSelectedRows(allMessageIDs);

      //corrected code for select all, pushing object with id and user_id
      const allRows = currentUsers.map((user) => ({
        id: user.messageID,
        user_id: user._id,
      }));
      setSelectedRows(allRows);
    } else {
      setSelectedRows([]);
    }
  };

  const handleUnselectAll = () => {
    setIsChecked(false);
    setSelectedRows([]);
  };
  const [isModalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const handleRowClickModal = (data) => {
    navigate(`/home/history/${data}`);
    const filteredMessage = messages.find((msg) => msg._id === data);
    setModalOpen(true);
    setData(filteredMessage);
    console.log("Received success " + JSON.stringify(data));
  };

  const handleRowSelection = (selectedRow) => {
    setSelectedRows((prev) => {
      const alreadySelected = prev.some((row) => row.id === selectedRow.id); //Corrected line
      if (alreadySelected) {
        return prev.filter((row) => row.id !== selectedRow.id); //Corrected line
      } else {
        return [...prev, selectedRow]; //Corrected line
      }
    });
  };

  const completedCount = selectedRows.filter((id) =>
    currentUsers.find(
      (user) => user.messageID === id && user.respond === "completed"
    )
  ).length;

  const isSelected = (id) => selectedRows.some((row) => row.id === id);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentHeaderKey, setCurrentHeaderKey] = useState(null);

  const handleClick = (event, headerKey) => {
    setAnchorEl(event.currentTarget);
    setCurrentHeaderKey(headerKey);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  console.log("selectedRows: ", selectedRows);
  console.log(currentUsers, "currentUsers");

  const handleUpdateAll = async (e) => {
    e.preventDefault();

    // Check if there are any selected rows
    if (selectedRows.length === 0) {
      console.log("No rows selected for update.");
      return; // Exit if no rows are selected
    }

    // Iterate through each selected row object
    for (const { id, user_id } of selectedRows) {
      try {
        // Send PUT request to update the message
        const response = await axios.put(`/user/message/update/${id}`, {
          percentage: 100, // Assuming this is a required field
          userId: user_id, // Use user_id from the current object
          respond: "completed", // Other fields as necessary
        });
        console.log(`Successfully updated message ${id}:`, response.data);
      } catch (error) {
        // Log the error message for the specific ID
        console.error(`Error updating message ${id}:`, error.message);
      }
    }
  };

  return (
    <>
     {isModalOpen && <ModalView data={data} />}
      <motion.div
        variants={fadeIn("up", 0.1)}
        initial="hidden"
        whileInView={"show"}
        className="search"
      >
        <input
          type="search"
          value={searchTerm.toString()}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      </motion.div>
      <motion.table
        variants={fadeIn("up", 0.1)}
        initial="hidden"
        whileInView="show"
        className="user-table"
      >
        <thead>
          <tr>
            {headerTable.map((header, index) => (
              <th key={index}>
                <div className="label-container">
                  <span
                    onClick={() => handleSort(header.KEY.toLowerCase())}
                    className="sortable-header"
                  >
                    {header.Label}
                  </span>

                  {/* Display MoreVertIcon and Menu for filtering options */}
                  {header.Label !== "ACTION" && header.Label !== "#" && (
                    <>
                      <IconButton
                        aria-controls={anchorEl ? "simple-menu" : undefined}
                        aria-haspopup="true"
                        onClick={(e) => handleClick(e, header.KEY)}
                      >
                        <MoreVertIcon
                          fontSize="small"
                          sx={{ color: "white" }}
                        />
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
                        {header.Label !== "DATE"
                          ? [
                              <MenuItem
                                key="all-option"
                                onClick={() => {
                                  handleFilterChange(
                                    header.KEY.toLowerCase(),
                                    ""
                                  );
                                  handleClose();
                                }}
                              >
                                All
                              </MenuItem>,
                              ...[
                                ...new Set(
                                  filteredUsers.map(
                                    (user) => user[header.KEY] || "No Data"
                                  )
                                ),
                              ].map((value) => (
                                <MenuItem
                                  key={value}
                                  onClick={() => {
                                    handleFilterChange(
                                      header.KEY.toLowerCase(),
                                      value
                                    );
                                    handleClose();
                                  }}
                                >
                                  {value}
                                </MenuItem>
                              )),
                            ]
                          : [
                              <MenuItem
                                key="newest-first"
                                onClick={() => {
                                  handleDateSortChange("desc");
                                  handleClose();
                                }}
                              >
                                Newest First
                              </MenuItem>,
                              <MenuItem
                                key="oldest-first"
                                onClick={() => {
                                  handleDateSortChange("asc");
                                  handleClose();
                                }}
                              >
                                Oldest First
                              </MenuItem>,
                            ]}
                      </Menu>
                    </>
                  )}

                  {/* Checkbox for the "#" column if there's an ACTION header */}
                  {header.Label === "#" &&
                    headerTable.some((h) => h.Label === "ACTION") && (
                      <input
                        className="checkedAll"
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleSelectAll}
                      />
                    )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {currentUsers.length === 0 ? (
            <tr className="items-row" key={`no-data`}>
              <td colSpan={headerTable.length + 2}>No data</td>
            </tr>
          ) : (
            currentUsers.map((data, index) => {
              const isItemSelected = isSelected(data.messageID);
              return (
                <tr
                  onClick={
                    filterStatus.toString() === "completed"
                      ? () => {
                          console.log("Row clicked:", data.messageID);
                          handleRowClickModal(data.messageID);
                        }
                      : undefined
                  }
                  className={`items-row ${isItemSelected ? "selected" : ""} ${
                    filterStatus.toString() === "completed" ? "clickable" : ""
                  }`}
                  key={`${index}-${data._id}`}
                >
                  {headerTable.map((header, headerIndex) => {
                    const columnLabel = header.KEY.toLowerCase();
                    if (columnLabel === "number") {
                      return (
                        <td key={headerIndex}>{firstIndex + index + 1}</td>
                      );
                    }
                    if (columnLabel === "createdat") {
                      return (
                        <td key={headerIndex}>
                          {data.updatedAt
                            ? new Date(data.updatedAt).toLocaleString()
                            : "No Data"}
                        </td>
                      );
                    }

                    if (columnLabel === "action") {
                      return (
                        <td colSpan={headerTable.length + 1} key={headerIndex}>
                          <button
                            className="action-btn view-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(data);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="action-btn select-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowSelection({
                                id: data.messageID,
                                user_id: data._id,
                              });
                            }}
                          >
                            {isItemSelected ? "Deselect" : `Select`}
                          </button>
                        </td>
                      );
                    }

                    if (columnLabel === "respond") {
                      return (
                        <td key={headerIndex}>
                          <div className={`data ${data.respond}`}>
                            {data.respond === "completed"
                              ? "Completed"
                              : data.respond === "pending"
                              ? "Pending"
                              : data.respond === "in-progress"
                              ? "In Progress"
                              : "No response received"}
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={`${columnLabel}-${headerIndex}`}>
                        {data[columnLabel] || "No Data"}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </motion.table>

      {/* Indicator for selected items */}
      {selectedRows.length > 0 ? (
        <div className="selection-indicator">
          Selected: {selectedRows.length} item(s)
          {/* Button for marking items as completed */}
          <div className="buttonContainer">
            {/* Button for unselecting all items */}
            <button
              className="unselect-all-btn"
              onClick={() => {
                handleUnselectAll(); // Call a function to clear selections
              }}
            >
              Unselect All
            </button>

            <button className="completed-action-btn" onClick={handleUpdateAll}>
              Mark as Completed
            </button>
          </div>
        </div>
      ) : (
        <div className="selection-indicator"></div>
      )}

      {totalPages > 1 && (
        <motion.div
          variants={fadeIn("right", 0.1)}
          initial="hidden"
          whileInView={"show"}
          className="containerNav"
        >
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
        </motion.div>
      )}

      <DialogCompleted
        messages={dialogData.message}
        users={dialogData.user}
        parents={dialogData.parents}
        responders={dialogData.responders}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />
    </>
  );
};

export default Table;
