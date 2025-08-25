import React, { useState, useContext, useEffect, useRef } from "react";
import "./Amnex.css";
import { AuthContext } from "../context/AuthContext";
import * as XLSX from "xlsx";
import Select from "react-select";

function Amnex() {
  const { user } = useContext(AuthContext);
  const [fleetData, setFleetData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ File input refs
  const fileInputRef = useRef(null);       // System Diagnostics
  const tamperingInputRef = useRef(null);  // Tampering Image

  const [formData, setFormData] = useState({
    engineerName: "",
    fleetNumber: "",
    depo: "",
    deviceId: "",
    vehicleStatus: "Open",
    sparesUsed: "",
    systemDiagnostics: null,
    remarks: "",
    tampering: "No",
    tamperingImage: null,
    missingComponent: "",
    replacedComponent: "",
  });

  // ✅ Fill engineer name from context
  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({ ...prev, engineerName: user.username }));
    }
  }, [user]);

  // ✅ Load master data from Excel
  useEffect(() => {
    const loadExcel = async () => {
      try {
        const response = await fetch("/MASTER_DATA_ADAIKAL.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets["AMX_MASTER"];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const cleanData = jsonData.map((row) => ({
          fleetNumber: row["Fleet Number"],
          depo: row["Depot"],
          deviceId: row["Device ID"],
        }));

        setFleetData(cleanData);
      } catch (err) {
        console.error("Error loading Excel file:", err);
      }
    };
    loadExcel();
  }, []);

  // ✅ Fleet auto-fill
  const handleFleetSelect = (selectedOption) => {
    const fleetNumber = selectedOption?.value || "";
    const selected = fleetData.find((item) => item.fleetNumber === fleetNumber);

    if (selected) {
      setFormData({
        ...formData,
        fleetNumber: selected.fleetNumber,
        depo: selected.depo,
        deviceId: selected.deviceId,
        engineerName: user?.username || formData.engineerName,
      });
    }
  };

  // ✅ Handle input/file change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result })); // save Base64
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Submit form to GAS
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload = { ...formData, type: "amnex" };

      // 🚫 Remove tampering fields if "No"
      if (formData.tampering === "No") {
        delete payload.tamperingImage;
        delete payload.missingComponent;
        delete payload.replacedComponent;
      }

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzfmM9sJ6H5GgBcY8TTxNY76wA3CrL8k5OQTLOXFwqoISiFWnygtVvAFoSRiUZdk1on1A/exec",
        {
          method: "POST",
          body: new URLSearchParams(payload),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        alert("✅ Form submitted!\n📄 PDF Links saved in sheet.");

        // ✅ Reset form
        setFormData({
          engineerName: user?.username || "",
          fleetNumber: "",
          depo: "",
          deviceId: "",
          vehicleStatus: "Open",
          sparesUsed: "",
          systemDiagnostics: null,
          remarks: "",
          tampering: "No",
          tamperingImage: null,
          missingComponent: "",
          replacedComponent: "",
        });

        // ✅ Reset file inputs manually
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (tamperingInputRef.current) tamperingInputRef.current.value = "";
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit form!");
    }
    setLoading(false);
  };

  return (
    <div className="amnex-container">
      <div className="amnex-header">
        <h1>Amnex Service Form</h1>
        <p>Complete the form below to submit a new service request</p>
      </div>
      
      <div className="amnex-content">
        <form className="amnex-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">👤</div>
              <h3>Engineer Information</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Engineer Name *</label>
                <div className="input-container">
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.engineerName} 
                    readOnly 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">🚛</div>
              <h3>Vehicle Details</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Fleet Number *</label>
                <div className="input-container">
                  <Select
                    className="custom-select"
                    classNamePrefix="custom-select"
                    options={fleetData.map((f) => ({ value: f.fleetNumber, label: f.fleetNumber }))}
                    onChange={handleFleetSelect}
                    placeholder="Select Fleet Number"
                    value={
                      formData.fleetNumber
                        ? { value: formData.fleetNumber, label: formData.fleetNumber }
                        : null
                    }
                    isClearable
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Depot *</label>
                <div className="input-container">
                  <input type="text" className="form-input" value={formData.depo} readOnly />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Device ID *</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="deviceId"
                    className="form-input"
                    value={formData.deviceId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Vehicle Status *</label>
                <div className="input-container">
                  <select
                    name="vehicleStatus"
                    className="form-input"
                    value={formData.vehicleStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="Open">Open</option>
                    <option value="Close">Close</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">🔧</div>
              <h3>Service Details</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Spares Required *</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="sparesUsed"
                    className="form-input"
                    value={formData.sparesUsed}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">System Diagnostics *</label>
                <div className="input-container file-input-container">
                  <input
                    type="file"
                    name="systemDiagnostics"
                    className="file-input"
                    onChange={handleChange}
                    ref={fileInputRef}
                    required
                  />
                  <div className="file-input-custom">
                    <span className="file-input-text">
                      {formData.systemDiagnostics ? "File selected" : "Choose file"}
                    </span>
                    <span className="file-input-button">Browse</span>
                  </div>
                </div>
              </div>

              <div className="input-group full-width">
                <label className="input-label">Remarks *</label>
                <div className="input-container">
                  <textarea
                    name="remarks"
                    className="form-input textarea"
                    rows="3"
                    value={formData.remarks}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">⚠️</div>
              <h3>Tampering Information</h3>
            </div>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Tampering Happened? *</label>
                <div className="input-container">
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="tampering"
                        value="No"
                        checked={formData.tampering === "No"}
                        onChange={handleChange}
                        required
                      />
                      <span className="radio-custom"></span>
                      No
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="tampering"
                        value="Yes"
                        checked={formData.tampering === "Yes"}
                        onChange={handleChange}
                      />
                      <span className="radio-custom"></span>
                      Yes
                    </label>
                  </div>
                </div>
              </div>

              {formData.tampering === "Yes" && (
                <>
                  <div className="input-group">
                    <label className="input-label">Tampering Image *</label>
                    <div className="input-container file-input-container">
                      <input
                        type="file"
                        name="tamperingImage"
                        className="file-input"
                        onChange={handleChange}
                        ref={tamperingInputRef}
                        required
                      />
                      <div className="file-input-custom">
                        <span className="file-input-text">
                          {formData.tamperingImage ? "Image selected" : "Choose image"}
                        </span>
                        <span className="file-input-button">Browse</span>
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Missing Component *</label>
                    <div className="input-container">
                      <input
                        type="text"
                        name="missingComponent"
                        className="form-input"
                        value={formData.missingComponent}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Replaced Component *</label>
                    <div className="input-container">
                      <input
                        type="text"
                        name="replacedComponent"
                        className="form-input"
                        value={formData.replacedComponent}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="button-icon">📤</span>
                  Submit Form
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Amnex;