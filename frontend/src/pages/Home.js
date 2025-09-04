import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logoutattendance");
  };

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon"></span>
              <h1 className="title">Prime Edge</h1>
            </div>
            <p className="tagline">Maintenance Management System</p>
          </div>

          {user && (
            <div className="user-info">
              <div className="user-details">
                <span className="username">Welcome, {user.username}</span>
                <span className="user-role">Engineer</span>
              </div>
              {user.photo ? (
                <img src={user.photo} alt="profile" className="profile-pic" />
              ) : (
                <div className="profile-placeholder">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="welcome-section">
          <h2>Select a Form to Get Started</h2>
          <p>Choose the appropriate form for your maintenance task</p>
        </div>

        {/* Cards Section */}
        <div className="cards-container">
          <Link to="/amnex" className="card amnex-card">
            <div className="card-icon">🚌</div>
            <div className="card-content">
              <h3>Amnex</h3>
              <p>Access Amnex maintenance form</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          
          <Link to="/TNSTC" className="card tnstc-card">
            <div className="card-icon">🚎</div>
            <div className="card-content">
              <h3>TNSTC</h3>
              <p>Access TNSTC maintenance form</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          
          <Link to="/MTC" className="card mtc-card">
            <div className="card-icon">🚍</div>
            <div className="card-content">
              <h3>MTC</h3>
              <p>Access MTC maintenance form</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
          
          <Link to="/switch" className="card switch-card">
            <div className="card-icon">🚎</div>
            <div className="card-content">
              <h3>Switch</h3>
              <p>Access Switch maintenance form</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="logout-icon">⎋</span>
          Logout
        </button>
        <div className="footer-info">
          <p>Prime Edge Maintenance System</p>
        </div>
      </div>
    </div>
  );
}

export default Home;