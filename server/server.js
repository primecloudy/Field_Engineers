const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // to read JSON from frontend

// Temporary in-memory storage (later replace with DB)
let users = [];

// ✅ Create user (POST /api/users)
app.post("/api/users", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const newUser = { id: Date.now(), username, password };
  users.push(newUser);

  res.status(201).json(newUser);
});

// ✅ Get all users (GET /api/users)
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});
