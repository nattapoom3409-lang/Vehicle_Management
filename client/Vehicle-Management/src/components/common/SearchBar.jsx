import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.css";

function SearchBar({ filters, onSearch }) {
  // เพิ่ม onSearch เข้ามาใน props
  const [text, setText] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  const clearInput = () => setText("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpenFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleFilter = (group, option) => {
    setSelectedFilters((prev) => {
      const current = prev[group] || [];
      if (current.includes(option)) {
        return { ...prev, [group]: current.filter((item) => item !== option) };
      }
      return { ...prev, [group]: [...current, option] };
    });
  };

  const selectAll = (group, options) => {
    setSelectedFilters((prev) => {
      const current = prev[group] || [];
      return {
        ...prev,
        [group]: current.length === options.length ? [] : options,
      };
    });
  };

  // ระบบ Debounce: ส่งค่ากลับไปหา Parent หลังจากหยุดพิมพ์ 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch({ text, filters: selectedFilters });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [text, selectedFilters, onSearch]);

  return (
    <div className="searchbar-container" ref={containerRef}>
      <div className="searchbox">
        <div className="searchbox-icon search">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.34-4.34" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="searchbox-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {text && (
          <div className="searchbox-icon x" onClick={clearInput}>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      <div className="searchfilter">
        <div
          className={`filter-icon ${openFilter ? "active" : ""}`}
          onClick={() => setOpenFilter(!openFilter)}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path d="M10 5H3M12 19H3M14 3v4M16 17v4M21 12h-9M21 19h-5M21 5h-7M8 10v4M8 12H3" />
          </svg>
        </div>
      </div>
      {openFilter && (
        <div className="filter-dropdown">
          {filters.map((filter, i) => (
            <div key={i} className="filter-group">
              <div className="filter-title">
                {filter.label}
                <button
                  className="select-all"
                  onClick={() => selectAll(filter.label, filter.options)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  >
                    <path d="M16 5H3M16 12H3M11 19H3M15 18l2 2 4-4" />
                  </svg>
                </button>
              </div>
              <ul className="filter-options">
                {filter.options.map((option, index) => {
                  const active = (selectedFilters[filter.label] || []).includes(
                    option,
                  );
                  return (
                    <li
                      key={index}
                      className={`filter-option ${active ? "active" : ""}`}
                      onClick={() => toggleFilter(filter.label, option)}
                    >
                      {option}
                      {active && (
                        <span className="check-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-check-icon lucide-check"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
