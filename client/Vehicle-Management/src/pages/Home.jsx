import React from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import ChangeTheme from "../components/common/ChangeTheme";
import UserDropdown from "../components/common/UserDropdown";
import { useAuth } from "../hooks/useAuth";
import "./Home.css";

const menuItems = [
  {
    path: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    path: "vehicles",
    label: "Vehicles",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },

  {
    path: "warehouse",
    label: "Warehouse",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11" />
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z" />
      </svg>
    ),
  },
  {
    path: "usermanagement",
    label: "User Management",
    icon: (
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
        class="lucide lucide-user-round-pen-icon lucide-user-round-pen"
      >
        <path d="M2 21a8 8 0 0 1 10.821-7.487" />
        <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
        <circle cx="10" cy="8" r="5" />
      </svg>
    ),
  },
];

function Home() {
  const { isEmployee, isManager } = useAuth();

  const filteredMenu = menuItems.filter((item) => {
    // if (item.path === "vehicledetail" && !isEmployee) return false;
    if (item.path === "report" && !isManager) return false;
    if (item.path === "usermanagement" && !isManager) return false;
    return true;
  });
  return (
    <div className="Home-container">
      <div className="Home-header">
        <div className="Home-logo">
          <Link to="/home/dashboard">Vehicle Management</Link>
        </div>
        <div className="Home-user">
          <div className="Home-setting">
            <ChangeTheme />
          </div>
          <UserDropdown />
        </div>
      </div>
      <div className="Home-navbar">
        <div className="Home-menu">
          <ul>
            {filteredMenu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "menu-link active" : "menu-link"
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="Home-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Home;
