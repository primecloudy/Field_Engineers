import React, { useState, useContext, useEffect, useRef } from "react";
import "./Amnex.css";
import { AuthContext } from "../context/AuthContext";
import * as XLSX from "xlsx";
import Select from "react-select";

function Amnex() {
  const { user } = useContext(AuthContext);
  const [fleetData, setFleetData] = useState([]);
  const [filteredFleets, setFilteredFleets] = useState([]);
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
        
        // Try different possible sheet names
        const sheet = workbook.Sheets["AMX_MASTER"] || 
                     workbook.Sheets["Sheet1"] || 
                     workbook.Sheets[workbook.SheetNames[0]];
        
        if (sheet) {
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          console.log("✅ Excel Rows:", jsonData);
          setFleetData(jsonData);
        } else {
          console.error("❌ No sheet found in Excel file");
        }
      } catch (err) {
        console.error("Error loading Excel file:", err);
        alert("Failed to load fleet data. Please refresh the page or contact support.");
      }
    };
    loadExcel();
  }, []);

  // ✅ Handle typing Fleet Number
  const handleFleetNumberChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, fleetNumber: value }));

    if (value.length > 0) {
      const filtered = fleetData.filter((fleet) => {
        // Try multiple possible column names for fleet number
        const fleetNumber = fleet["Fleet Number"] || fleet["Fleet Numb -1"] || fleet["FleetNumber"] || "";
        return String(fleetNumber)
          .toLowerCase()
          .includes(value.toLowerCase());
      });
      setFilteredFleets(filtered);
    } else {
      setFilteredFleets([]);
    }
  };

  // ✅ Handle selecting a Fleet from dropdown
  const handleSelectFleet = (fleet) => {
    setFormData((prev) => ({
      ...prev,
      fleetNumber: fleet["Fleet Number"] || fleet["Fleet Numb -1"] || fleet["FleetNumber"] || "",
      depo: fleet["Depot"] || fleet["Depo"] || "",
      deviceId: fleet["Device ID"] || fleet["IMEI"] || fleet["IMEI Number"] || "",
    }));
    setFilteredFleets([]);
  };

  // ✅ Handle input/file change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Submit form to GAS
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("Starting form submission...");
    
    // Prepare payload
    let payload = { 
      engineerName: formData.engineerName,
      fleetNumber: formData.fleetNumber,
      depo: formData.depo,
      deviceId: formData.deviceId,
      vehicleStatus: formData.vehicleStatus,
      sparesUsed: formData.sparesUsed,
      remarks: formData.remarks,
      tampering: formData.tampering,
    };

    // Add tampering details only if tampering is "Yes"
    if (formData.tampering === "Yes") {
      payload.missingComponent = formData.missingComponent;
      payload.replacedComponent = formData.replacedComponent;
    }

    // Handle file uploads
    if (formData.systemDiagnostics) {
      const systemDiagnosticsBase64 = await fileToBase64(formData.systemDiagnostics);
      payload.systemDiagnostics = systemDiagnosticsBase64;
    }

    if (formData.tampering === "Yes" && formData.tamperingImage) {
      const tamperingImageBase64 = await fileToBase64(formData.tamperingImage);
      payload.tamperingImage = tamperingImageBase64;
    }

    console.log("Payload prepared:", payload);

    // ✅ REPLACE WITH YOUR ACTUAL GOOGLE APPS SCRIPT URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRi4E7S4znsRhWDSyO8tu6X2nE98t2Se2lo1kpKqanT_AwPYou-R7URfoKVXfE82H-rg/exec";
    
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    console.log("Response:", result);
    
    if (result.result === "success") {
      alert("✅ Form submitted successfully! PDF generated: " + result.pdfUrl);
      
      // Reset form
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

      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (tamperingInputRef.current) tamperingInputRef.current.value = "";
    } else {
      alert("❌ Error: " + result.message);
    }
  } catch (err) {
    console.error("Submit error details:", err);
    alert("Failed to submit form! Check console for details.");
  }
  setLoading(false);
};

// Helper function to convert file to base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

  return (
    <div className="mtc container mt-5">
      <h2>Amnex Service Form</h2>
      <form onSubmit={handleSubmit} className="form-container">
        {/* Engineer Name */}
        <div className="form-group">
          <label>Engineer Name:</label>
          <input
            type="text"
            name="engineerName"
            value={formData.engineerName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fleet Number */}
        <div className="form-group" style={{position: 'relative'}}>
          <label>Fleet Number:</label>
          <input
            type="text"
            value={formData.fleetNumber}
            onChange={handleFleetNumberChange}
            placeholder="Type Fleet Number"
            required
          />
          {filteredFleets.length > 0 && (
            <ul className="dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              margin: 0,
              padding: 0,
              listStyle: 'none'
            }}>
              {filteredFleets.map((fleet, index) => {
                const fleetNumber = fleet["Fleet Number"] || fleet["Fleet Numb -1"] || fleet["FleetNumber"] || "";
                return (
                  <li 
                    key={index} 
                    onClick={() => handleSelectFleet(fleet)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {fleetNumber}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Depot */}
        <div className="form-group">
          <label>Depot:</label>
          <input 
            type="text" 
            value={formData.depo} 
            readOnly 
            style={{backgroundColor: '#f5f5f5'}}
          />
        </div>

        {/* Device ID */}
        <div className="form-group">
          <label>Device ID:</label>
          <input
            type="text"
            name="deviceId"
            value={formData.deviceId}
            onChange={handleChange}
            required
          />
        </div>

        {/* Vehicle Status */}
        <div className="form-group">
          <label>Vehicle Status:</label>
          <select
            name="vehicleStatus"
            value={formData.vehicleStatus}
            onChange={handleChange}
            required
          >
            <option value="Open">Open</option>
            <option value="Close">Close</option>
          </select>
        </div>

        {/* Spares Required */}
        <div className="form-group">
          <label>Spares Required:</label>
          <input
            type="text"
            name="sparesUsed"
            value={formData.sparesUsed}
            onChange={handleChange}
            required
          />
        </div>

        {/* System Diagnostics */}
        <div className="form-group">
          <label>System Diagnostics:</label>
          <input
            type="file"
            name="systemDiagnostics"
            onChange={handleChange}
            ref={fileInputRef}
            required
          />
        </div>

        {/* Remarks */}
        <div className="form-group">
          <label>Remarks:</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Tampering */}
        <div className="form-group">
          <label>Tampering Happened?</label>
          <div>
            <label>
              <input
                type="radio"
                name="tampering"
                value="No"
                checked={formData.tampering === "No"}
                onChange={handleChange}
                required
              />
              No
            </label>
            <label style={{marginLeft: '15px'}}>
              <input
                type="radio"
                name="tampering"
                value="Yes"
                checked={formData.tampering === "Yes"}
                onChange={handleChange}
              />
              Yes
            </label>
          </div>
        </div>

        {/* Tampering Details (only show if Yes) */}
        {formData.tampering === "Yes" && (
          <>
            <div className="form-group">
              <label>Tampering Image:</label>
              <input
                type="file"
                name="tamperingImage"
                onChange={handleChange}
                ref={tamperingInputRef}
                required
              />
            </div>

            <div className="form-group">
              <label>Missing Component:</label>
              <input
                type="text"
                name="missingComponent"
                value={formData.missingComponent}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Replaced Component:</label>
              <input
                type="text"
                name="replacedComponent"
                value={formData.replacedComponent}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="btn btn-primary mt-3">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default Amnex;