// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, deleteUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });

  // ✅ Load users from server (only if admin)
 const loadUsers = () => {
  fetch("http://localhost:5000/api/users")
    .then(res => res.json())
    .then(data => setUsers(data))
    .catch(err => console.error("Failed to load users:", err));
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
}else {
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
      <div className="container mt-5 text-center">
        <h3>🚫 Access Denied</h3>
        <p>You must be an <strong>Admin</strong> to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center"> Admin Dashboard</h2>

      {/* Create User Form */}
      <div className="card p-3 shadow-lg mb-4">
        <h4>Create New User</h4>
        <form onSubmit={handleCreateUser} className="d-flex gap-2 mt-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            className="form-control"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn btn-success">
            Create
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="card p-3 shadow-lg">
        <h4>Registered Users</h4>
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-dark">
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
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u.username)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

            {users.filter((u) => u.username !== "admin").length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
