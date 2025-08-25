import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [attendanceDone, setAttendanceDone] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // ✅ Ensure admin user always exists
    if (!users.find((u) => u.username === "admin")) {
      users.push({ username: "admin", password: "admin123", role: "admin" });
      localStorage.setItem("users", JSON.stringify(users));
    }

    // ✅ Restore session if available
    const savedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (savedUser) setUser(savedUser);

    // ✅ Restore attendance
    const savedAttendance = localStorage.getItem("attendanceDone") === "true";
    setAttendanceDone(savedAttendance);

    const savedRecords =
      JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    setAttendanceRecords(savedRecords);
  }, []);

  // ✅ Login
  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!foundUser) return null;

    setUser(foundUser);
    localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
    setAttendanceDone(false); // reset attendance when login
    return foundUser.role;
  };

  // ✅ Logout → prepare for attendance
  const logout = () => {
    setAttendanceDone(false);
    localStorage.removeItem("attendanceDone");
    // ⚠️ Keep user until logout attendance is marked
  };

  // ✅ Mark attendance
  const markAttendance = (type = "login") => {
    const newRecord = {
      user: user?.username,
      type, // "login" or "logout"
      date: new Date().toLocaleString(),
    };

    const updatedRecords = [...attendanceRecords, newRecord];
    setAttendanceRecords(updatedRecords);
    localStorage.setItem("attendanceRecords", JSON.stringify(updatedRecords));

    if (type === "login") {
      setAttendanceDone(true);
      localStorage.setItem("attendanceDone", "true");
    } else if (type === "logout") {
      // clear user completely on logout attendance
      setUser(null);
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("attendanceDone");
      setAttendanceDone(false);
    }
  };

  // ✅ Admin create user
  const createUser = (username, password) => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find((u) => u.username === username)) return false;

    users.push({ username, password, role: "user" });
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  };

  // ✅ Admin delete user (but never admin)
  const deleteUser = (username) => {
    if (username === "admin") return; // prevent admin delete

    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.filter((u) => u.username !== username);
    localStorage.setItem("users", JSON.stringify(users));

    // If deleted user is currently logged in → logout
    if (user && user.username === username) {
      logout();
      setUser(null);
      localStorage.removeItem("loggedInUser");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        attendanceDone,
        markAttendance,
        attendanceRecords,
        createUser,
        deleteUser,
        setUser,
        setAttendanceDone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
