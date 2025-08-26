const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = "./users.json";

// ✅ Helper to load users
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([{ username: "admin", password: "admin123", role: "admin" }], null, 2));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

// ✅ Helper to save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ✅ GET all users
app.get("/api/users", (req, res) => {
  const users = loadUsers();
  res.json(users);
});

// ✅ POST create new user
app.post("/api/users", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username & password required" });
  }

  const users = loadUsers();
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = { username, password, role: "user" };
  users.push(newUser);
  saveUsers(users);

  res.status(201).json(newUser);
});

// ✅ DELETE user
app.delete("/api/users/:username", (req, res) => {
  const { username } = req.params;
  let users = loadUsers();

  if (username === "admin") {
    return res.status(400).json({ error: "Cannot delete admin account" });
  }

  users = users.filter((u) => u.username !== username);
  saveUsers(users);

  res.json({ success: true, message: `User ${username} deleted` });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
