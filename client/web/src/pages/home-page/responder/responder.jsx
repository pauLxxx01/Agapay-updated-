import React, { useContext, useState } from "react";
import Table from "../../../components/table/table";
import { responderTable } from "../../../newData";
import { AuthContext } from "../../../context/authContext";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../variants";
import './responder.scss'

const Responder = () => {
  const [, , , , , responder] = useContext(AuthContext);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" for ascending, "desc" for descending
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;

  // Handle sorting logic
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Filter data based on the search term
  const filteredResponders = responder.filter((item) =>
    Object.values(item)
      .some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Sort data based on current sortKey and sortOrder
  const sortedResponders = [...filteredResponders].sort((a, b) => {
    if (!sortKey) return 0; // No sorting by default
    const aValue = a[sortKey]?.toString().toLowerCase() || "";
    const bValue = b[sortKey]?.toString().toLowerCase() || "";
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

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
        variants={fadeIn("down", 0.1)}
        initial="hidden"
        whileInView={"show"}
        className="title"
      >
        <h1>Responder</h1>
      </motion.div>
       <motion.div
              variants={zoomIn(0.1)}
              initial="hidden"
              whileInView="show"
              className="count-container"
            >
              <div className="count-responders">
                <span className="dataCount">{responder.length}</span>
                <span className="dataCount">Responders</span>
              </div>
            </motion.div>
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
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        initial="hidden"
        animate="show"
        className="user-table"
      >
        <thead>
          <tr>
            {responderTable.map((header) => (
              <th
                key={header.id}
                onClick={() => handleSort(header.KEY)}
                style={{ cursor: "pointer" }}
              >
                {header.Label}
                {sortKey === header.KEY && (sortOrder === "asc" ? " ▲" : " ▼")}
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
              <tr
                className="items-row"
                key={index}
                onClick={() => console.log("Row clicked:", data)}
              >
                {responderTable.map((column) => (
                  <td key={column.KEY}>{data[column.KEY]}</td>
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
              {/* Pagination logic */}
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

export default Responder;
