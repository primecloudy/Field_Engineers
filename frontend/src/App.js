import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Home from "./pages/Home";
import Amnex from "./pages/Amnex";
import Lowflower from "./pages/Lowflower";
import SwitchPage from "./pages/Switch";
import LogoutAttendance from "./pages/LogoutAttendance";

// ✅ PrivateRoute for role-based protection
const PrivateRoute = ({ children, role }) => {
  const { user, attendanceDone } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (role === "admin" && user.role !== "admin") return <Navigate to="/" />;

  // Only enforce attendance before home, not on logout
  if (
    role === "user" &&
    user.role === "user" &&
    !attendanceDone &&
    window.location.pathname !== "/attendance"
  ) {
    return <Navigate to="/attendance" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />


          {/* Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="admin">
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* User Attendance (only at login) */}
          <Route
            path="/attendance"
            element={
              <PrivateRoute role="user">
                <Attendance />
              </PrivateRoute>
            }
          />

          {/* User Home */}
          <Route
            path="/home"
            element={
              <PrivateRoute role="user">
                <Home />
              </PrivateRoute>
            }
          />

          {/* Other pages */}
          <Route path="/amnex" element={<Amnex />} />
          <Route path="/lowflower" element={<Lowflower />} />
          <Route path="/switch" element={<SwitchPage />} />

          {/* Logout Attendance */}
          <Route path="/logoutattendance" element={<LogoutAttendance />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
