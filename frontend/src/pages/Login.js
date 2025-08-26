import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // ✅ add this

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      alert("⚠️ Please enter username and password");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users");
      const users = await response.json();

      const user = users.find(
        (u) =>
          u.username === credentials.username &&
          u.password === credentials.password
      );

      if (user) {
        setUser(user); // ✅ update context
        alert(`✅ Welcome, ${user.username}!`);

        if (user.role === "admin") {
          navigate("/dashboard"); // admin page
        } else {
          navigate("/attendance"); // normal user page
        }
      } else {
        alert("❌ Invalid username or password");
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
