import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "./UserManagement.css";
import SearchBar from "../components/common/SearchBar";

function UserManagement() {
  const API_BASE = "http://localhost:3001";
  const { isManager, isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [image, setImage] = useState(null);

  const [openRole, setOpenRole] = useState(null);
  const [openStatus, setOpenStatus] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    access_level: "employee",
  });

  const filters = [
  {
    label: "Role",
    options: ["admin", "manager", "employee", "visitor"],
  },
  {
    label: "Status",
    options: ["active", "inactive"],
  },
];

  // =========================
  // GET USERS
  // =========================
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
  setFilteredUsers(users);
}, [users]);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".role-cell, .status-cell, .action-cell")) {
        setOpenStatus(null);
        setOpenRole(null);
        setOpenMenu(null);
      }
    };

    window.addEventListener("click", closeDropdown);

    return () => window.removeEventListener("click", closeDropdown);
  }, []);


  const handleSearch = ({ text, filters }) => {
  let result = [...users];

  // 🔍 search text
  if (text) {
    const lower = text.toLowerCase();

    result = result.filter((u) =>
      u.username.toLowerCase().includes(lower) ||
      u.email.toLowerCase().includes(lower) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(lower)
    );
  }

  // 🎯 filter role
  if (filters.Role && filters.Role.length > 0) {
    result = result.filter((u) =>
      filters.Role.includes(u.access_level)
    );
  }

  // 🎯 filter status
  if (filters.Status && filters.Status.length > 0) {
    result = result.filter((u) =>
      filters.Status.includes(u.status)
    );
  }

  setFilteredUsers(result);
};

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // START EDIT
  // =========================
  const startEdit = (user) => {
    setEditingUser(user);

    setForm({
      username: user.username,
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      access_level: user.access_level,
    });

    setShowForm(true);
  };

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await fetch(`${API_BASE}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // CREATE / UPDATE USER
  // =========================
// =========================
// CREATE / UPDATE USER
// =========================
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const url = editingUser
      ? `${API_BASE}/api/users/${editingUser.id}`
      : `${API_BASE}/api/users`;

    const method = editingUser ? "PUT" : "POST";

    const formData = new FormData();

    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("access_level", form.access_level);

    if (image) {
      formData.append("profileImage", image);
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await res.json();

    // ❗ สำคัญมาก
    if (!res.ok) {
      alert(data.message || "Create user failed");
      return;
    }

    alert(editingUser ? "Updated!" : "User created!");

    fetchUsers();
    setEditingUser(null);
    setImage(null);

    setForm({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      access_level: "employee",
    });

    setShowForm(false);
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

  // =========================
  // CHANGE STATUS
  // =========================
  const changeStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/users/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    });

    fetchUsers();
  };

  return (
    <div className="user-management-container">
      <h1>User Management</h1>

      <SearchBar filters={filters} onSearch={handleSearch} />

      <button
        onClick={() => {
          setEditingUser(null);
          setShowForm(true);
        }}
        className={`add-user-btn ${showForm ? "active" : ""}`}
      >
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
            class="lucide lucide-plus-icon lucide-plus"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </span>
        Create User
      </button>

      {showForm && (isManager || isAdmin) && (
        <div
          className="user-form-wrapper"
          onClick={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        >
          <form
            className="user-form"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingUser ? "Edit User" : "Create User"}</h2>

            <button
              type="button"
              className="close-btn"
              onClick={() => {
                setShowForm(false);
                setEditingUser(null);
              }}
            >
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
                class="lucide lucide-x-icon lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="user-input-form">
              <div className="user-input-form-group">
                <input
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
                <label>Username</label>
              </div>

              <div className="user-input-form-group">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <label>Email</label>
              </div>

              <div className="user-input-form-group">
                <input
                  name="first_name"
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
                <label>First Name</label>
              </div>

              <div className="user-input-form-group">
                <input
                  name="last_name"
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
                <label>Last Name</label>
              </div>

              <div className="user-input-form-group">
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editingUser}
                />
                <label>{editingUser ? "New Password" : "Password"}</label>
              </div>

              <div className="user-select-form-group">
                <div className="select-form">
                  <div
                    className={`selected-role-display ${openRole ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenRole(openRole === "form" ? null : "form");
                    }}
                  >
                    {form.access_level}
                    <span className={`arrow ${openRole ? "active" : ""}`}>
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
                        class="lucide lucide-chevron-down-icon lucide-chevron-down"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </div>
                  <label>Role</label>

                  {openRole === "form" && (
                    <div className="dropdown-menu">
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          setForm({ ...form, access_level: "visitor" });
                          setOpenRole(null);
                        }}
                      >
                        Visitor
                      </div>
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          setForm({ ...form, access_level: "employee" });
                          setOpenRole(null);
                        }}
                      >
                        Employee
                      </div>
                      {isAdmin && (
                        <>
                          <div
                            className="dropdown-item"
                            onClick={() => {
                              setForm({ ...form, access_level: "manager" });
                              setOpenRole(null);
                            }}
                          >
                            Manager
                          </div>
                          <div
                            className="dropdown-item"
                            onClick={() => {
                              setForm({ ...form, access_level: "admin" });
                              setOpenRole(null);
                            }}
                          >
                            Admin
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="user-input-file-group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <label>User Image</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingUser ? "Save" : "Add User"}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
{filteredUsers.map((u) => (
    <tr key={u.id}>
                <td className="username">{u.username}</td>

                <td className="user-name">
                  {u.first_name} {u.last_name}
                </td>

                <td className="email">{u.email}</td>

                <td className="role-cell">
                  <div className="role-badge">{u.access_level}</div>
                </td>

                <td className="date">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>

                <td className="status-cell">
                  <div
                    className={`status-badge ${u.status}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenStatus(openStatus === u.id ? null : u.id);
                    }}
                  >
                    {u.status}
                    <span
                      className={`arrow ${openStatus === u.id ? "active" : ""}`}
                    >
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
                        class="lucide lucide-chevron-down-icon lucide-chevron-down"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </div>

                  {openStatus === u.id && (
                    <div
                      className="status-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="dropdown-item active"
                        onClick={() => {
                          changeStatus(u.id, "active");
                          setOpenStatus(null);
                        }}
                      >
                        Active
                      </div>
                      <div
                        className="dropdown-item inactive"
                        onClick={() => {
                          changeStatus(u.id, "inactive");
                          setOpenStatus(null);
                        }}
                      >
                        Inactive
                      </div>
                    </div>
                  )}
                </td>

                <td className="action-cell">
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === u.id ? null : u.id);
                    }}
                  >
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
                      class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>

                  {openMenu === u.id && (
                    <div
                      className="action-menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          startEdit(u);
                          setOpenMenu(null);
                        }}
                      >
                        Edit
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            deleteUser(u.id);
                            setOpenMenu(null);
                          }}
                          className="delete"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
