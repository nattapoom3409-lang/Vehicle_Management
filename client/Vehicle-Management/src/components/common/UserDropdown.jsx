import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDropdown.css";

function UserDropdown() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  //   useEffect(() => {
  //     const fetchProfile = async () => {
  //       try {
  //         const token = localStorage.getItem("token");

  //         const res = await fetch(`${API_BASE}/profile`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         });

  //         if (!res.ok) {
  //           throw new Error("Unauthorized");
  //         }

  //         const data = await res.json();
  //         setUser(data);
  //       } catch (err) {
  //         console.error(err);
  //         handleLogout();
  //       }
  //     };

  //     fetchProfile();
  //   }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef}>
      <div className="user-icon" onClick={() => setOpen((prev) => !prev)}>
        <img src="/img/me.jpg" alt="profile" />
      </div>

      {open && (
        <div className="userdropdown">
          <div className="user-img">
            <img src="/img/me.jpg" alt="profile" />
          </div>
          <div className="user-name text">
            {storedUser
              ? `${storedUser.first_name} ${storedUser.last_name}`
              : "Unknown User"}
          </div>
          <div className="user-accesslevel text">
            Access Level: {localStorage.getItem("role") || "Unknown"}{" "}
          </div>

          <button onClick={handleLogout} className="user-logout text">
            Logout{" "}
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
              class="lucide lucide-log-out-icon lucide-log-out"
            >
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
