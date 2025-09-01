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
        <h2 className="title">Prime Edge</h2>

        {user && (
          <div className="user-info">
            {user.photo ? (
              <img src={user.photo} alt="profile" className="profile-pic" />
            ) : (
              <div className="profile-placeholder">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <span className="username">{user.username}</span>
          </div>
        )}
      </div>

      {/* Cards Section */}
      <div className="cards-container">
        <Link to="/amnex" className="card amnex-card">
          <h3>Amnex</h3>
          <p>Access Amnex Form</p>
        </Link>
        {/* <Link to="/lowflower" className="card lowflower-card">
          <h3>Lowflower</h3>
          <p>Access Lowflower Form</p>
        </Link> */}
        <Link to="/switch" className="card switch-card">
          <h3>Switch</h3>
          <p>Access Switch Form</p>
        </Link>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default Home;
