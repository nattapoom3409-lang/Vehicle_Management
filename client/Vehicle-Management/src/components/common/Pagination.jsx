import React from "react";
import "./Pagination.css"

function Pagination({ currentPage, setCurrentPage, totalPages }) {
  return (
    <div className="pagination">
      <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={currentPage === i + 1 ? "active" : ""}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;