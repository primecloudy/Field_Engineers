import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // ✅ add this

const handleLogin = async (e) => {
  e.preventDefault();

  const { username, password } = credentials;

  if (!username || !password) {
    alert("⚠️ Please enter username and password");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setUser(data.user); // ✅ set user in context
      alert(`✅ Welcome, ${data.user.username}!`);

      if (data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/attendance");
      }
    } else {
      alert(data.error || "❌ Invalid username or password");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("⚠️ Failed to connect to server");
  }
};



  return (
    <div className="container mt-5">
      <h2 className="text-center">Login</h2>
      <form onSubmit={handleLogin} className="card p-4 shadow-lg mt-3">
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
