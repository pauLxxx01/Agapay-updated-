// import React, { useContext, useState } from "react";
// import { AuthContext } from "../../../context/authContext";
// import { motion } from "framer-motion";
// import { fadeIn, zoomIn } from "../../../variants";
// import { IconButton, Menu, MenuItem } from "@mui/material";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import "./responder.scss";
// import { responderTable } from "../../../newData";
// import { Link, useNavigate } from "react-router-dom";

// const Responder = () => {
//   const [, , , , , responder] = useContext(AuthContext);
//   const [sortConfig, setSortConfig] = useState({ key: null, order: "asc" });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 7;
//   const [filters, setFilters] = useState({});
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [currentHeaderKey, setCurrentHeaderKey] = useState(null);

//   const navigate = useNavigate();
//   // Sorting logic
//   const handleSort = (key) => {
//     setSortConfig((prev) => ({
//       key,
//       order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
//     }));
//   };

//   // Filter change logic
//   const handleFilterChange = (key, value) => {
//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       [key]: value,
//     }));
//     handleClose();
//   };

//   // Close dropdown menu
//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   // Open dropdown menu
//   const handleClick = (event, headerKey) => {
//     setAnchorEl(event.currentTarget);
//     setCurrentHeaderKey(headerKey);
//   };

//   // Filter data
//   const filteredResponders =
//     responder?.filter((item) => {
//       const matchesSearch = Object.values(item).some((value) =>
//         value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//       );

//       const matchesFilters = Object.entries(filters).every(
//         ([key, filterValue]) =>
//           filterValue === ""
//             ? true
//             : (item[key]?.toString().toLowerCase() || "").includes(
//                 filterValue.toLowerCase()
//               )
//       );

//       return matchesSearch && matchesFilters;
//     }) || [];

//   // Sort data
//   const sortedResponders = [...filteredResponders].sort((a, b) => {
//     const { key, order } = sortConfig;
//     if (!key) return 0;
//     const aValue = a[key]?.toString().toLowerCase() || "";
//     const bValue = b[key]?.toString().toLowerCase() || "";
//     if (aValue < bValue) return order === "asc" ? -1 : 1;
//     if (aValue > bValue) return order === "asc" ? 1 : -1;
//     return 0;
//   });

//   // Pagination logic
//   const lastIndex = currentPage * recordsPerPage;
//   const firstIndex = lastIndex - recordsPerPage;
//   const currentUsers = sortedResponders.slice(firstIndex, lastIndex);
//   const totalPages = Math.ceil(filteredResponders.length / recordsPerPage);

//   const handlePageChange = (page) => setCurrentPage(page);
//   const prePage = (e) => {
//     e.preventDefault();
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };
//   const nextPage = (e) => {
//     e.preventDefault();
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   return (
//     <div className="container-responder">
    
//       <motion.div
//         variants={zoomIn(0.1)}
//         initial="hidden"
//         whileInView="show"
//         className="count-container"
//       >
//         <div className="count-history">
//           <span className="dataCount">{responder?.length || 0}</span>
//           <span className="dataCount">Total Responders</span>
//         </div>
//       </motion.div>
//       <div className="btn-create-responder">
//         <button className="btn-create" onClick={() => navigate("/home/responder/registration")}>
//           Create Responder
//         </button>
//       </div>
//       <motion.div
//         variants={fadeIn("up", 0.1)}
//         initial="hidden"
//         whileInView="show"
//         className="search"
//       >
//         <input
//           type="search"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search..."
//         />
//       </motion.div>
//       <motion.table
//         variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
//         initial="hidden"
//         animate="show"
//         className="user-table"
//       >
//         <thead>
//           <tr>
//             {responderTable.map((header) => (
//               <th key={header.id}>
//                 {header.Label}
//                 {header.KEY !== "number" &&
//                   header.KEY !== "name" &&
//                   header.KEY !== "account_id" && (
//                     <>
//                       <IconButton onClick={(e) => handleClick(e, header.KEY)}>
//                         <MoreVertIcon
//                           fontSize="small"
//                           sx={{ color: "white" }}
//                         />
//                       </IconButton>
//                       <Menu
//                         id="simple-menu"
//                         anchorEl={anchorEl}
//                         keepMounted
//                         open={
//                           Boolean(anchorEl) && currentHeaderKey === header.KEY
//                         }
//                         onClose={handleClose}
//                       >
//                         <MenuItem
//                           key="all-option"
//                           onClick={() => handleFilterChange(header.KEY, "")}
//                         >
//                           All
//                         </MenuItem>
//                         {[
//                           ...new Set(
//                             filteredResponders.map(
//                               (user) => user[header.KEY] || "No Data"
//                             )
//                           ),
//                         ].map((value) => (
//                           <MenuItem
//                             key={value}
//                             onClick={() =>
//                               handleFilterChange(header.KEY, value)
//                             }
//                           >
//                             {value}
//                           </MenuItem>
//                         ))}
//                       </Menu>
//                     </>
//                   )}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {currentUsers.length === 0 ? (
//             <tr>
//               <td colSpan={responderTable.length}>No data</td>
//             </tr>
//           ) : (
//             currentUsers.map((data, index) => (
//               <tr key={index} onClick={() => console.log("Row clicked:", data)}>
//                 {responderTable.map((column, headerIndex) => (
//                   <td key={headerIndex}>
//                     {column.KEY === "number"
//                       ? firstIndex + index + 1
//                       : data[column.KEY]}
//                   </td>
//                 ))}
//               </tr>
//             ))
//           )}
//         </tbody>
//       </motion.table>
//       {totalPages > 1 && (
//         <motion.div
//           variants={fadeIn("right", 0.1)}
//           initial="hidden"
//           whileInView={"show"}
//           className="containerNav"
//         >
//           <nav>
//             <ul className="pagination-modal">
//               {currentPage > 1 && (
//                 <li className="page-items">
//                   <button className="page-links" onClick={prePage}>
//                     Previous
//                   </button>
//                 </li>
//               )}
//               {(() => {
//                 const pageNumbers = [];
//                 const maxVisiblePages = 3; // Adjust for your desired truncation window
//                 const halfVisible = Math.floor(maxVisiblePages / 2);

//                 let startPage = Math.max(1, currentPage - halfVisible);
//                 let endPage = Math.min(totalPages, currentPage + halfVisible);

//                 if (currentPage <= halfVisible) {
//                   endPage = Math.min(maxVisiblePages, totalPages);
//                 }
//                 if (currentPage + halfVisible >= totalPages) {
//                   startPage = Math.max(1, totalPages - maxVisiblePages + 1);
//                 }

//                 if (startPage > 1) {
//                   pageNumbers.push(
//                     <li key="first" className="page-items">
//                       <button
//                         className="page-links"
//                         onClick={() => handlePageChange(1)}
//                       >
//                         1
//                       </button>
//                     </li>
//                   );
//                   if (startPage > 2) {
//                     pageNumbers.push(
//                       <li key="start-ellipsis" className="page-items ellipsis">
//                         ...
//                       </li>
//                     );
//                   }
//                 }

//                 for (let i = startPage; i <= endPage; i++) {
//                   pageNumbers.push(
//                     <li
//                       key={i}
//                       onClick={() => handlePageChange(i)}
//                       className={`page-items ${
//                         currentPage === i ? "active" : ""
//                       }`}
//                     >
//                       <button className="page-links">{i}</button>
//                     </li>
//                   );
//                 }

//                 if (endPage < totalPages) {
//                   if (endPage < totalPages - 1) {
//                     pageNumbers.push(
//                       <li key="end-ellipsis" className="page-items ellipsis">
//                         ...
//                       </li>
//                     );
//                   }
//                   pageNumbers.push(
//                     <li key="last" className="page-items">
//                       <button
//                         className="page-links"
//                         onClick={() => handlePageChange(totalPages)}
//                       >
//                         {totalPages}
//                       </button>
//                     </li>
//                   );
//                 }

//                 return pageNumbers;
//               })()}
//               {currentPage < totalPages && (
//                 <li className="page-items">
//                   <button className="page-links" onClick={nextPage}>
//                     Next
//                   </button>
//                 </li>
//               )}
//             </ul>
//           </nav>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default Responder;


import React, { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../variants";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./responder.scss";
import { responderTable } from "../../../newData";
import { Link, useNavigate } from "react-router-dom";

const Accounts = ({responder}) => {

  const [sortConfig, setSortConfig] = useState({ key: null, order: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentHeaderKey, setCurrentHeaderKey] = useState(null);

  const navigate = useNavigate();
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
    responder?.filter((item) => {
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

  return (
    <div className="container-responder">
    
      <motion.div
        variants={zoomIn(0.1)}
        initial="hidden"
        whileInView="show"
        className="count-container"
      >
        <div className="count-history">
          <span className="dataCount">{responder?.length || 0}</span>
          <span className="dataCount">Total Responders</span>
        </div>
      </motion.div>
      <div className="btn-create-responder">
        <button className="btn-create" onClick={() => navigate("/home/responder/registration")}>
          Create Responder
        </button>
      </div>
      <motion.div
        variants={fadeIn("up", 0.1)}
        initial="hidden"
        whileInView="show"
        className="search"
      >
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      </motion.div>
      <motion.table
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        animate="show"
        className="user-table"
      >
        <thead>
          <tr>
            {responderTable.map((header) => (
              <th key={header.id}>
                {header.Label}
                {header.KEY !== "number" &&
                  header.KEY !== "name" &&
                  header.KEY !== "account_id" && (
                    <>
                      <IconButton onClick={(e) => handleClick(e, header.KEY)}>
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
                        <MenuItem
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
                            key={value}
                            onClick={() =>
                              handleFilterChange(header.KEY, value)
                            }
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
              <td colSpan={responderTable.length}>No data</td>
            </tr>
          ) : (
            currentUsers.map((data, index) => (
              <tr key={index} onClick={() => console.log("Row clicked:", data)}>
                {responderTable.map((column, headerIndex) => (
                  <td key={headerIndex}>
                    {column.KEY === "number"
                      ? firstIndex + index + 1
                      : data[column.KEY]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </motion.table>
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
    </div>
  );
};

export default Accounts;
