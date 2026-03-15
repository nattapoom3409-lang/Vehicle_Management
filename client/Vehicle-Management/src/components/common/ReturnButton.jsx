import React from "react";
import "./ReturnButton.css"

function ReturnButton({ onClick }) {
  return (
    <button className="return-btn" onClick={onClick}>
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-chevron-left-icon lucide-chevron-left"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </span>
      Return
    </button>
  );
}

export default ReturnButton;
