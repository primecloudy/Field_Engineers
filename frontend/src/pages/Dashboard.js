// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { createUser, deleteUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(savedUsers);
  }, []);

  // ✅ Create new user
  const handleCreate = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      alert("Please fill all fields");
      return;
    }

    const success = createUser(newUser.username, newUser.password);
    if (success) {
      const updated = JSON.parse(localStorage.getItem("users")) || [];
      setUsers(updated);
      setNewUser({ username: "", password: "" });
      alert("✅ User created successfully!");
    } else {
      alert("❌ Username already exists!");
    }
  };

  // ✅ Delete user (permanent from localStorage)
  const handleDelete = (username) => {
    if (username === "admin") {
      alert("❌ Cannot delete admin account!");
      return;
    }

    // remove from localStorage
    const updated = users.filter((u) => u.username !== username);
    localStorage.setItem("users", JSON.stringify(updated));

    // update context too
    deleteUser(username);

    // update state
    setUsers(updated);

    alert(`🗑️ User "${username}" deleted permanently!`);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Admin Dashboard</h2>

      {/* Create User Form */}
      <div className="card p-3 shadow-lg mb-4">
        <h4>Create New User</h4>
        <form onSubmit={handleCreate} className="d-flex gap-2 mt-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
          />
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
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
              <th>Password</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
  {users
    .filter((u) => u.username !== "admin") // ✅ hide admin account
    .map((u, index) => (
      <tr key={index}>
        <td>{u.username}</td>
        <td>{u.password}</td>
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

  {/* If only admin exists → show "No users" */}
  {users.filter((u) => u.username !== "admin").length === 0 && (
    <tr>
      <td colSpan="4" className="text-center">
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
