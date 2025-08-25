// src/pages/Login.js
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
      navigate("/dashboard");
    } else if (role === "user") {
      navigate("/attendance");
    } else {
      alert("Invalid credentials. Please contact admin to create user.");
    }
  };

  return (
    <div className="login-wrapper">
  <div className="glass-card">
    <h3 className="glass-title">Login</h3>
    <form onSubmit={handleLogin}>
      <input
        type="text"
        className="glass-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        className="glass-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="glass-btn">Login</button>
    </form>
  </div>
</div>

  );
}

export default Login;
