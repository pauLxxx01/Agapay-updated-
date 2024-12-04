import React, { useState } from "react";
import "./modal.scss";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../../variants";
import { headerTableModal } from "../../../../newData";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";

function Modal({ setOpenModal, title, data, users }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortDirection, setSortDirection] = useState("desc");

  const handleDateSortToggle = () => {
    setSortDirection((prevDirection) =>
      prevDirection === "desc" ? "asc" : "desc"
    );
  };

  const filteredUsers = useMemo(() => {
    return data
      .filter((datas) =>
        users.some(
          (user) =>
            user._id.toString() === datas.senderId.toString() &&
            (datas.senderId
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              user.account_id
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              user.department
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (datas.createdAt &&
                datas.createdAt.toString().includes(searchTerm)) ||
              (datas.respond &&
                datas.respond.toString().includes(searchTerm.toLowerCase())) ||
              (datas.emergency &&
                datas.emergency.toString().includes(searchTerm.toLowerCase())))
        )
      )
      .map((datas) => {
        const matchedUser = users.find(
          (user) => user._id.toString() === datas.senderId.toString()
        );
        return {
          ...matchedUser,
          createdAt: datas ? datas.createdAt : null,
          messageID: datas ? datas._id : null,
          respond: datas ? datas.respond : null,
          emergency: datas ? datas.emergency : null,
        };
      })
      .sort((a, b) =>
        sortDirection === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
    return;
  }, [data, users, sortDirection, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSearch = (e) => setSearchTerm(e.target.value);

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
      navigate(`/home/report/in-progress/${data.messageID}`, {
        state: { id: data },
      });
    } else {
      navigate(`/home/report/${data.messageID}`);
    }
  };

  return (
    <div className="main-modal">
      <motion.div
        variants={zoomIn(0)}
        initial="hidden"
        whileInView={"show"}
        className="popup"
      >
        <div className="containerModal">
          <div className="button-container">
            <button onClick={() => setOpenModal(false)}>X</button>
          </div>
          <motion.div className="popup-header">
            <span>{data.length}</span>
            <span>{title}</span>
          </motion.div>
          <div className="search">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
            />
          </div>
          <div className="container-body">
            <table>
              <thead className="headerTableModal">
                <tr>
                  {headerTableModal.map((header, index) => (
                     <th
                     key={index}
                     onClick={
                       header.Label === "DATE" ? handleDateSortToggle : undefined
                     }
                     style={{
                       cursor: header.Label === "DATE" ? "pointer" : "default",
                     }}
                   >
                     {header.Label}
                     {header.Label === "DATE" &&
                       (sortDirection === "desc" ? " ↑" : " ↓")}
                   </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((row, index) => (
                    <tr key={`${row._id}-${index}`}>
                      {/* Combine `_id` with `index` for uniqueness */}
                      <td>{row.name}</td>
                      <td>{row.account_id}</td>
                      <td>{row.department}</td>
                      <td>
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>{row.respond.toUpperCase()}</td>
                      <td>
                        <div>
                          <p
                            className="showView"
                            onClick={() => handleRowClick(row)}
                          >
                            View Report
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
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
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`page-items ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button className="page-links">{i + 1}</button>
                    </li>
                  ))}
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
      </motion.div>
    </div>
  );
}

export default Modal;
