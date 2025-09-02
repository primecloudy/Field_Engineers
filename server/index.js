const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

// 🔹 Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  fs.readFile(USERS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read users" });

    const users = JSON.parse(data || "[]");
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid username or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: { username, role: user.role },
    });
  });
});

// 🔹 Get all users (safe, no password in response)
app.get("/api/users", (req, res) => {
  fs.readFile(USERS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read users" });
    const users = JSON.parse(data || "[]");

    // only send username + role
    const safeUsers = users.map(({ username, role }) => ({
      username,
      role,
    }));

    res.json(safeUsers);
  });
});

// 🔹 Create user
app.post("/api/users", (req, res) => {
  const { username, password, role } = req.body;
  fs.readFile(USERS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read users" });
    let users = JSON.parse(data || "[]");

    if (users.find((u) => u.username === username)) {
      return res.status(400).json({ error: "User already exists" });
    }

    users.push({ username, password, role });
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save user" });
      res.json({ message: "User created successfully" });
    });
  });
});

// 🔹 Delete user
app.delete("/api/users/:username", (req, res) => {
  const { username } = req.params;
  fs.readFile(USERS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read users" });
    let users = JSON.parse(data || "[]");

    users = users.filter((u) => u.username !== username);

    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete user" });
      res.json({ message: "User deleted successfully" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
