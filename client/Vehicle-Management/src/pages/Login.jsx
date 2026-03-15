import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChangeTheme from "../components/common/ChangeTheme";
import Validation from "../utils/LoginValidation";
import "./Login.css";

function Login() {
    const API_BASE = "http://localhost:3001";
  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
    //   navigate("/home/dashboard");
      navigate("/");
    }
  }, [navigate]);

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInput = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (validationErrors.username === "" && validationErrors.password === "") {
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        let data;

        try {
          data = await response.json();
        } catch {
          data = { message: "Invalid server response" };
        }

        console.log("LOGIN RESPONSE:", data);

        if (!response.ok) {
          alert(data.message);
          return;
        }

        // เก็บ token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.access_level);

        navigate("/");
        // navigate("/home/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        console.log("Server error");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="form-header">Login</div>
        <form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleInput}
              className="auth-input-box"
              placeholder="Enter Username"
            />

            <label>Username</label>

            <div className="auth-icon">
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
                class="lucide lucide-user-icon lucide-user"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleInput}
              className="auth-input-box password-input"
              placeholder="Password"
            />

            <label>Password</label>

            <button
              type="button"
              className="toggle-password auth-icon"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
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
                  class="lucide lucide-eye-icon lucide-eye"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
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
                  class="lucide lucide-eye-off-icon lucide-eye-off"
                >
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                  <path d="m2 2 20 20" />
                </svg>
              )}
            </button>
            {errors.password && (
              <div className="error-text">{errors.password}</div>
            )}
          </div>

          <button type="submit" className="auth-submit-btn">
            Login
          </button>
        </form>
        <div className="auth-changetheme">
          <ChangeTheme />
        </div>
      </div>
    </div>
  );
}

export default Login;
