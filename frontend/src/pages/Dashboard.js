// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { deleteUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });

  // ✅ Load users from server
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // ✅ Create new user
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers([...users, data]); // add new user to table
        setNewUser({ username: "", password: "" }); // clear form
        alert("✅ User created successfully!");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Create error:", error);
      alert("⚠️ Failed to create user. Check backend server.");
    }
  };

  // ✅ Delete user from backend
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
        setUsers(users.filter((u) => u.username !== username));
        deleteUser(username); // remove from context too
        alert(`🗑️ ${data.message}`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("⚠️ Failed to delete user. Check backend server.");
    }
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
              .filter((u) => u.username !== "admin")
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
