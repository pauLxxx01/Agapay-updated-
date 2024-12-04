import React from 'react'

const table = ({header, datas}) => {
  return (
    <div>
         <motion.div
        variants={fadeIn("up", 0.1)}
        initial="hidden"
        whileInView={"show"}
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
        variants={fadeIn("up", 0.1)}
        initial="hidden"
        whileInView={"show"}
        className="user-table"
      >
        <thead>
          <tr>
            {headerTableGeneral.map((header, index) => (
              <th key={index}>{header.Label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((data) => (
            <tr
              className="items-row"
              key={data.messageID}
              onClick={() => handleRowClick(data)}
            >
              <td>{data.name}</td>
              <td>{data.userId}</td>
              <td>{data.department}</td>
              <td>{data.emergency}</td>
              <td>{data.createdAt || ""}</td>
              <td>
                <div className={`data ${data.respond}`}>
                  {data.respond === "completed"
                    ? "Completed"
                    : data.respond === "unused"
                    ? "Unused"
                    : data.respond === "in-progress"
                    ? "In - Progress"
                    : "No respond received"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </motion.table>

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages).keys()].map((pageNumber) => (
            <Link
              key={pageNumber}
              to={`/home/report?page=${pageNumber + 1}`}
              className={pageNumber + 1 === currentPage ? "active" : ""}
            >
              {pageNumber + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default table