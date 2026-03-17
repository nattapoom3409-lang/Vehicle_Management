import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDropdown.css";

function UserDropdown() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const API_BASE = "http://localhost:3001";

  // ✅ ดึง user ล่าสุดจาก API เพื่อให้ได้ profile_image ที่อัปเดตแล้ว
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((freshUser) => {
        // อัปเดต state และ localStorage ให้ sync กัน
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
        if (freshUser.access_level) {
          localStorage.setItem("role", freshUser.access_level);
        }
      })
      .catch((err) => {
        console.warn("Could not refresh user profile:", err.message);
        // fallback ใช้ข้อมูลจาก localStorage เดิม
      });
  }, []);

  const profileUrl = user?.profile_image
    ? `${API_BASE}/uploads/profiles/${user.profile_image}`
    : "/img/me.jpg";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  // ✅ ปิด dropdown เมื่อคลิกข้างนอก
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
    <div className="user-dropdown-container" ref={dropdownRef}>
      {/* 🔵 ICON บน Navbar */}
      <div className="user-icon" onClick={() => setOpen((prev) => !prev)}>
        <img
          src={profileUrl}
          alt="profile"
          onError={(e) => (e.target.src = "/img/default-avatar.png")}
        />
      </div>

      {open && (
        <div className="userdropdown">
          {/* 🔵 รูปใหญ่ */}
          <div className="user-img">
            <img
              src={profileUrl}
              alt="profile"
              onError={(e) => (e.target.src = "/img/default-avatar.png")}
            />
          </div>

          {/* 🔵 ชื่อ */}
          <div className="user-name text">
            {user ? `${user.first_name} ${user.last_name}` : "Unknown User"}
          </div>

          {/* 🔵 role */}
          <div className="user-accesslevel text">
            Access Level: {localStorage.getItem("role") || "Unknown"}
          </div>

          {/* 🔵 logout */}
          <button onClick={handleLogout} className="user-logout text">
            Logout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
