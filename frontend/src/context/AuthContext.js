import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [attendanceDone, setAttendanceDone] = useState(false);

  // ✅ Mark login attendance
  const markAttendance = () => {
  setAttendanceDone(true);
  localStorage.setItem("attendanceDone", "true");
};

  // ✅ Mark logout attendance (reset)
  const logoutAttendance = () => {
    setAttendanceDone(false);
    setUser(null);
    localStorage.removeItem("user");
  };

  // 🔹 Auto-login from localStorage
  useEffect(() => {
  const savedAttendance = localStorage.getItem("attendanceDone") === "true";
  setAttendanceDone(savedAttendance);

  const savedUser = localStorage.getItem("user");
  if (savedUser) setUser(JSON.parse(savedUser));
}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        attendanceDone,
        setAttendanceDone,   // ✅ make this available
        markAttendance,
        logoutAttendance,    // ✅ make this available
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
