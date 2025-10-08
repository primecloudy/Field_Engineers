// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, deleteUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Load users from server (only if admin)
  const loadUsers = () => {
    setIsLoading(true);
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load users:", err);
        setIsLoading(false);
      });
  };

  // ✅ Call this inside useEffect
  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Create new user (admin only)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const { username, password, role } = newUser;

    if (!username || !password) {
      alert("⚠️ Username and Password are required!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (response.ok) {
        alert("✅ " + (data.message || "User created successfully"));
        loadUsers(); // refresh users from backend
        setNewUser({ username: "", password: "", role: "user" });
      } else {
        alert("❌ " + (data.error || "Failed to create user"));
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("⚠️ Server error");
    }
  };

  // ✅ Delete user
  const handleDelete = async (username) => {
    if (username === "admin") {
      alert("❌ Cannot delete admin account!");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${username}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🗑️ ${data.message}`);
        loadUsers(); // refresh users from backend
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("⚠️ Failed to delete user. Check backend server.");
    }
  };

  // 🚫 Restrict access for normal users
  if (!user || user.role !== "admin") {
    return (
      <div className="dashboard-container">
        <div className="access-denied">
          <div className="access-denied-icon">🚫</div>
          <h3>Access Denied</h3>
          <p>You must be an <strong>Admin</strong> to view this page.</p>
        </div>
      </div>
    );
  }
// ll
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-welcome">
          <span>Welcome, {user.username}</span>
        </div>
      </div>

      {/* Create User Form */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Create New User</h2>
        </div>
        <form onSubmit={handleCreateUser} className="user-form">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <select
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="create-user-btn">
            Create User
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Registered Users</h2>
          <button onClick={loadUsers} className="refresh-btn">
            ↻ Refresh
          </button>
        </div>
        
        {isLoading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => u.username !== "admin") // hide admin from deletion
                  .map((u, index) => (
                    <tr key={index}>
                      <td>
                        <div className="user-info">
                          <span className="username">{u.username}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(u.username)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                {users.filter((u) => u.username !== "admin").length === 0 && (
                  <tr>
                    <td colSpan="3" className="no-users">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;