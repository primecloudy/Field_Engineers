import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const role = login(username, password);

    if (role === "admin") {
      navigate("/dashboard"); // ✅ admin goes to dashboard
    } else if (role === "user") {
      navigate("/attendance"); // ✅ user goes to attendance
    } else {
      alert("❌ Invalid credentials or user not created by admin.");
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg w-100" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-3">Login</h3>
        <form onSubmit={handleLogin}>
          {/* Username */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login Button */}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>

          {/* Note: remove signup link since only admin adds users */}
          <p className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
            Only admin-created users can log in.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
