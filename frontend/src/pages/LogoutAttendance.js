// src/pages/LogoutAttendance.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./LogoutAttendance.css";

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycby5szY6aVvOjdFO2RtsxQS9EEx2SnNwyY_ExbMHmmd4YXEFe0U3DN72ZE_UEr5-nKPPlg/exec";

const LogoutAttendance = () => {
  const { user, setUser, setAttendanceDone } = useContext(AuthContext);
  const navigate = useNavigate();

  const [engineerName] = useState(user?.username || "");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // 👈 live date/time

  // Update date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);

      if (navigator.geolocation) {
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              lat: pos.coords.latitude.toFixed(6),
              lng: pos.coords.longitude.toFixed(6),
            });
            setLoadingLocation(false);
          },
          () => {
            alert("⚠️ Location access is required!");
            setLoadingLocation(false);
          }
        );
      } else {
        alert("❌ Geolocation not supported by your browser.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      alert("⚠️ Please upload your photo!");
      return;
    }
    if (!location.lat || !location.lng) {
      alert("⚠️ Location is mandatory!");
      return;
    }

    try {
      setSubmitting(true);
      const reader = new FileReader();
      reader.readAsDataURL(photo);

      reader.onloadend = async () => {
        const base64Data = reader.result.split(",")[1]; // only base64, no prefix

        const payload = {
          engineerName,
          location: `${location.lat}, ${location.lng}`,
          photo: base64Data,
          timestamp: new Date().toISOString(), // 👈 send timestamp
        };

        const res = await fetch(WEB_APP_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        console.log("✅ GAS Response:", result);

        if (result.status === "success") {
          alert(
            `✅ Logout attendance submitted!\n🕒 Time: ${result.timestamp}\n📸 Photo: ${result.photoUrl}`
          );
        } else {
          alert("❌ Error: " + result.message);
        }

        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("attendanceDone");
        setAttendanceDone(false);
        navigate("/login");
      };
    } catch (err) {
      alert("❌ Error submitting: " + err.message);
      setSubmitting(false);
    }
  };

  // Format date/time for UI
  const formattedDate = currentDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="logout-page">
      <div className="logout-card">
        <h2 className="logout-title">🚪 Logout Attendance</h2>

        {/* 👇 Date & Time */}
        <div className="datetime-display">
          <div className="current-date">{formattedDate}</div>
          <div className="current-time">{formattedTime}</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Engineer Name */}
          <div className="form-group">
            <label>👷 Engineer Name</label>
            <input type="text" value={engineerName} readOnly />
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>📸 Upload Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview && (
              <div className="preview">
                <img src={photoPreview} alt="Preview" />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label>📍 Current Location</label>
            <input
              type="text"
              value={
                loadingLocation
                  ? "Fetching location..."
                  : location.lat && location.lng
                  ? `${location.lat}, ${location.lng}`
                  : "Upload photo to capture location"
              }
              readOnly
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "✅ Submit & Logout"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogoutAttendance;
