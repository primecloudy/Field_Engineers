import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Attendance.css"; // 👈 new CSS file for styling

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyViRo8-yTqT-d2Nf2G7JEvzyp0Ty2vNh5ksCYqvW3EOlIVkML7rSl_94Qrjb0gsqJzjQ/exec";

const Attendance = () => {
  const { attendanceDone, markAttendance, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [engineerName] = useState(user?.username || "");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // 👈 new state for date/time

  useEffect(() => {
    if (attendanceDone) {
      navigate("/home");
    }
  }, [attendanceDone, navigate]);

  // 👇 new useEffect for updating date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer); // Cleanup on component unmount
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
            alert("⚠️ Location access is required with photo upload!");
            setLoadingLocation(false);
          }
        );
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
      const base64Data = reader.result.split(",")[1];

      const payload = {
        engineerName,
        location: `${location.lat}, ${location.lng}`,
        photo: base64Data,
        timestamp: new Date().toISOString(),
      };

   const res = await fetch(WEB_APP_URL, {
  method: "POST",
  // headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});


      const result = await res.json();
      console.log("✅ GAS Response:", result);

      if (result.status === "success") {
        markAttendance();
        alert("✅ Attendance submitted!\n📄 PDF Link: " + result.fileUrl + "\n⏰ Time: " + result.timestamp);
        navigate("/home");
      } else {
        alert("❌ Error: " + result.message);
        setSubmitting(false);
      }
    };
  } catch (err) {
    alert("❌ Error submitting: " + err.message);
    setSubmitting(false);
  }
};

  // Format date and time for display
  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="attendance-wrapper">
      <div className="attendance-card">
        <h2 className="attendance-title">📋 Attendance Form</h2>
        
        {/* 👇 New date and time display */}
        <div className="datetime-display">
          <div className="current-date">{formattedDate}</div>
          <div className="current-time">{formattedTime}</div>
        </div>
        
        <form onSubmit={handleSubmit} className="attendance-form">
          {/* Engineer Name */}
          <div className="form-group">
            <label>Engineer Name</label>
            <input type="text" value={engineerName} readOnly />
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
            />
            {photoPreview && (
              <div className="preview-box text-center">
                <p>📷 Photo Preview:</p>
                <img src={photoPreview} alt="Preview" />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Current Location</label>
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
              required
            />
          </div>

          {/* Animated Submit Button */}
          <button
            type="submit"
            className="glass-btn"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "✅ Submit Attendance"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Attendance;