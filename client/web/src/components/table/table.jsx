import { motion } from "framer-motion";
import { fadeIn } from "../../variants";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./table.scss";
import useFilteredMessages from "../filterMessageBySender/filterMessage";
const Table = ({ messages, users, headerTable, filterStatus }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState("desc");
  const recordsPerPage = 5;

  const navigate = useNavigate();

  const handleDateSortToggle = () => {
    setSortDirection((prevDirection) =>
      prevDirection === "desc" ? "asc" : "desc"
    );
  };

  const filteredUsers = useMemo(() => {
    0;
    if (!messages || !users) return [];
    return messages
      .filter((data) =>
        users.some(
          (user) =>
            (user._id.toString() === data.senderId.toString() &&
              (data.senderId
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
                user.name
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
                (data.createdAt &&
                  new Date(data.createdAt)
                    .toLocaleString()
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())))) ||
            (data.respond &&
              data.respond
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (data.createdAt &&
              data.createdAt.toString().includes(searchTerm)) ||
            (data.emergency &&
              data.emergency
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        )
      )
      .map((data) => {
        const matchedUser = users.find(
          (user) => user._id.toString() === data.senderId.toString()
        );
        return {
          ...matchedUser,
          createdAt: data.createdAt
            ? new Date(data.createdAt).toLocaleString()
            : null,
          messageID: data._id,
          respond: data.respond,
          emergency: data.emergency,
        };
      })
      .sort((a, b) =>
        sortDirection === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [messages, users, searchTerm, sortDirection]);

  // Filter based on selected status
  const getFilteredUsersByStatus = () => {
    return filteredUsers.filter((user) => filterStatus.includes(user.respond));
  };

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentUsers = getFilteredUsersByStatus().slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(
    getFilteredUsersByStatus().length / recordsPerPage
  );

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
    } else if (data.respond === "pending") {
      navigate(`/home/report/${data.messageID}`);
    } else {
      navigate(`/home/report`);
    }
  };

  return (
    <>
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
        whileInView={"show"}
        className="user-table"
      >
        <thead>
          <tr>
            {headerTable.map((header, index) => (
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
          {currentUsers.length === 0 ? (
            <tr>
              <td colSpan={headerTable.length}>No data</td>
            </tr>
          ) : (
            currentUsers.map((data, index)=> (
              <tr
                className="items-row"
                key={`${index}-${data._id}`}
                onClick={() => handleRowClick(data)}
              >
                {headerTable.map((header, index) => {
                  const columnLabel = header.KEY.toLowerCase();
                  if (columnLabel === "createdat") {
                    return (
                      <td key={index}>
                        {data.createdAt
                          ? new Date(data.createdAt).toLocaleString()
                          : "No Data"}
                      </td>
                    );
                  }
                  if (columnLabel === "respond") {
                    return (
                      <td key={index}>
                        <div className={`data ${data.respond}`}>
                          {data.respond === "completed"
                            ? "Completed"
                            : data.respond === "pending"
                            ? "Pending"
                            : data.respond === "in-progress"
                            ? "In - Progress"
                            : "No respond received"}
                        </div>
                      </td>
                    );
                  }

                  return <td key={`${columnLabel}-${index}`}>{data[columnLabel] || "No Data"}</td>;
                })}
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
    </>
  );
};

export default Table;
