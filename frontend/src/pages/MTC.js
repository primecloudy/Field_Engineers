// src/pages/MTC.js
import React, { useState, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import "./MTC.css";
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";

function MTC() {
  const { user } = useContext(AuthContext);
  const [filteredFleets, setFilteredFleets] = useState([]);
  const [fleetData, setFleetData] = useState([]);
  const [formData, setFormData] = useState({
    engineerName: user?.username || "",
    fleetNumber: "",
    depo: "",
    imeiNumber: "",
    serviceType: "",
    ledVersion: "",
    preventiveFile: null,
    reportStatus: "",
    odometer: "",
    partFailure: [],
    sparesRequired: [],
    problemDescription: "",
    actionTaken: "",
    complaintsFile: null,
    mnvr: [],
    powerSupply: [],
    remarks: "",
    systemDiagnosticsFile: null,
    objective: "",
    updatesFile: null,
    preventiveSection: {},
  });
  const [submitting, setSubmitting] = useState(false);

  const partFailureOptions = [
    { value: "NONE", label: "NONE" },
    { value: "MNVR", label: "MNVR" },
    { value: "BDC", label: "BDC" },
    { value: "POE", label: "POE" },
    { value: "FDU", label: "FDU" },
    { value: "SDU", label: "SDU" },
    { value: "RDU", label: "RDU" },
    { value: "IDU", label: "IDU" },
    { value: "R.CAM", label: "R.CAM" },
    { value: "SSD", label: "SSD" },
    { value: "MIC", label: "MIC" },
    { value: "WIRING HARNESS", label: "WIRING HARNESS" },
    { value: "ANTENNA", label: "ANTENNA" },
    { value: "SPEAKER", label: "SPEAKER" },
    { value: "S.CAM", label: "S.CAM" },
  ];

  const mnvrOptions = [
    { value: "BASEBOARD", label: "Baseboard" },
    { value: "MOTHERBOARD", label: "Motherboard" }
  ];

  const powerSupplyOptions = [
    { value: "12V", label: "12V Power Supply" },
    { value: "QUECTEL", label: "Quectel (Modem)" },
    { value: "UFL_DAMAGE", label: "UFL Damage" },
    { value: "3A_FUSE", label: "3A Fuse" }
  ];

  const objectiveOptions = [
    { value: "LED_FW", label: "LED FW" },
    { value: "PIS", label: "PIS" },
    { value: "FIRMWARE", label: "Firmware" },
    { value: "IPC", label: "IPC" },
    { value: "SIM_INSTALLATION", label: "SIM Installation" },
    { value: "ROUTE_SELECTOR", label: "Route Selector Mission" }
  ];

  const ledVersionOptions = [
    { value: "PE", label: "PE" },
    { value: "FW", label: "FW" }
  ];

// ✅ Load Excel file when component mounts
useEffect(() => {
  fetch("/MASTER_DATA_ADAIKAL.xlsx")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.arrayBuffer();
    })
    .then((data) => {
      const workbook = XLSX.read(data, { type: "array" });
      console.log("Sheets in File:", workbook.SheetNames);

      // Try different possible sheet names
      const sheet = workbook.Sheets["LF_MASTER"] || 
                   workbook.Sheets["Sheet1"] || 
                   workbook.Sheets[workbook.SheetNames[0]];
      
      if (sheet) {
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        console.log("✅ Excel Rows:", jsonData);
        setFleetData(jsonData);
      } else {
        console.error("❌ No sheet found in Excel file");
      }
    })
    .catch((err) => {
      console.error("❌ Excel Load Error:", err);
      alert("Failed to load fleet data. Please refresh the page or contact support.");
    });
}, []);

  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({ ...prev, engineerName: user.username }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePreventiveSection = (field, value) => {
    setFormData({
      ...formData,
      preventiveSection: { ...formData.preventiveSection, [field]: value },
    });
  };

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
    imeiNumber: fleet["Device ID"] || fleet["IMEI"] || fleet["IMEI Number"] || "",
  }));
  setFilteredFleets([]);
};

  // ✅ Mark all preventive components as OKAY or NOT_OKAY
  const handleMarkAll = (status) => {
    const components = [
      "R-CAM", "FDU", "SDU", "RDU", "IDU", "MIC", "GPS", "GSM", "CAN",
      "M-ANN", "BDC COLOR", "BDC TOUCH", "USB", "PLAYBACK",
      "R-CAM CONNECTOR"
    ];

    const updatedSection = {};
    components.forEach((item) => {
      updatedSection[item] = status;
    });

    setFormData((prev) => ({
      ...prev,
      preventiveSection: updatedSection,
    }));
  };

  // ✅ Handle form submit
 const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  // Helper: Convert file to Base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve({ data: base64, mimeType: file.type, name: file.name });
      };
      reader.onerror = (error) => reject(error);
    });

  try {
    // Convert all files
    const preventiveFile = await toBase64(formData.preventiveFile);
    const complaintsFile = await toBase64(formData.complaintsFile);
    const updatesFile = await toBase64(formData.updatesFile);
    const systemDiagnosticsFile = await toBase64(formData.systemDiagnosticsFile);

    // Prepare payload
    const payload = {
      ...formData,
      preventiveFile,
      complaintsFile,
      updatesFile,
      systemDiagnosticsFile,
      partFailure: formData.partFailure || [],
      sparesRequired: formData.sparesRequired || [],
      mnvr: formData.mnvr || [],
      powerSupply: formData.powerSupply || [],
      preventiveSection: formData.preventiveSection || {}
    };

    console.log("Submitting payload:", payload);

    // Send to Google Apps Script
    const scriptURL = "https://script.google.com/macros/s/AKfycbzELmQD5U7_m4p9EwmbGhHTElLNXj3QElPy7Y8VsldPzF57ld4pc761pkgDr0bpvumVEw/exec";
    
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    // Handle Google Apps Script response
    const text = await response.text();
    console.log("Raw response:", text);
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON response: " + text);
    }

    if (result.result === "error") {
      throw new Error(result.message);
    }

    console.log("✅ Form submitted:", result);
    alert("Form submitted successfully!");

    // Reset form
    setFormData({
      engineerName: user?.username || "",
      fleetNumber: "",
      depo: "",
      imeiNumber: "",
      serviceType: "",
      ledVersion: "",
      preventiveFile: null,
      reportStatus: "",
      odometer: "",
      partFailure: [],
      sparesRequired: [],
      problemDescription: "",
      actionTaken: "",
      complaintsFile: null,
      mnvr: [],
      powerSupply: [],
      remarks: "",
      systemDiagnosticsFile: null,
      objective: "",
      updatesFile: null,
      preventiveSection: {},
    });

  } catch (error) {
    console.error("❌ Error submitting form:", error);
    alert("Error: " + error.message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="mtc container mt-5">
      <h2>MTC Page</h2>
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

{/* IMEI Number */}
<div className="form-group">
  <label>IMEI Number:</label>
  <input
    type="text"
    name="imeiNumber"
    value={formData.imeiNumber}
    onChange={handleChange}
    // This field is editable as requested
  />
</div>

        {/* Service Type */}
        <div className="form-group">
          <label>Service Type:</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Preventive">Preventive</option>
            <option value="Complaints">Complaints</option>
            <option value="Updates">Updates</option>
          </select>
        </div>

        {/* Preventive Section */}
        {formData.serviceType === "Preventive" && (
          <>
            <div className="form-group preventive-section">
              <h4 className="section-title">Preventive Section</h4>
              <div className="button-group mb-2">
                <button type="button" onClick={() => handleMarkAll("OKAY")} className="btn btn-success btn-sm me-2">
                  All OK
                </button>
                <button type="button" onClick={() => handleMarkAll("NOT_OKAY")} className="btn btn-danger btn-sm">
                  All Not OK
                </button>
              </div>

              <table className="preventive-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>OKAY</th>
                    <th>NOT OKAY</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "R-CAM", "FDU", "SDU", "RDU", "IDU", "MIC", "GPS", "GSM", "CAN",
                    "M-ANN", "BDC COLOR", "BDC TOUCH", "USB", "PLAYBACK",
                    "R-CAM CONNECTOR"
                  ].map((item) => (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>
                        <input
                          type="radio"
                          name={item}
                          value="OKAY"
                          checked={formData.preventiveSection[item] === "OKAY"}
                          onChange={(e) => handlePreventiveSection(item, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="radio"
                          name={item}
                          value="NOT_OKAY"
                          checked={formData.preventiveSection[item] === "NOT_OKAY"}
                          onChange={(e) => handlePreventiveSection(item, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="form-group">
              <label>LED Version:</label>
              <select
                name="ledVersion"
                value={formData.ledVersion}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="PE">PE</option>
                <option value="FW">FW</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preventive Attachment:</label>
              <input
                type="file"
                name="preventiveFile"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Report Status:</label>
              <select
                name="reportStatus"
                value={formData.reportStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
                <option value="None">None</option>
              </select>
            </div>

            {(formData.reportStatus === "Open" || formData.reportStatus === "Close") && (
              <>
                <div className="form-group">
                  <label>Odometer:</label>
                  <input
                    type="text"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Part Failure:</label>
                  <Select
                    isMulti
                    name="partFailure"
                    options={partFailureOptions}
                    value={partFailureOptions.filter((opt) =>
                      (formData.partFailure || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        partFailure: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select failed parts"
                  />
                </div>

                <div className="form-group">
                  <label>Spares Required:</label>
                  <Select
                    isMulti
                    name="sparesRequired"
                    options={partFailureOptions}
                    value={partFailureOptions.filter((opt) =>
                      (formData.sparesRequired || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        sparesRequired: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select required parts"
                  />
                </div>

                <div className="form-group">
                  <label>Problem Description:</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken:</label>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Complaints Attachment:</label>
                  <input
                    type="file"
                    name="complaintsFile"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>MNVR:</label>
                  <Select
                    isMulti
                    name="mnvr"
                    options={mnvrOptions}
                    value={mnvrOptions.filter((opt) =>
                      (formData.mnvr || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        mnvr: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select MNVR issues"
                  />
                </div>

                <div className="form-group">
                  <label>Power Supply:</label>
                  <Select
                    isMulti
                    name="powerSupply"
                    options={powerSupplyOptions}
                    value={powerSupplyOptions.filter((opt) =>
                      (formData.powerSupply || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        powerSupply: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select power supply issues"
                  />
                </div>

                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="systemDiagnosticsFile"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {formData.reportStatus === "None" && (
              <>
                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="systemDiagnosticsFile"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Complaints Section */}
        {formData.serviceType === "Complaints" && (
          <>
            <div className="form-group">
              <label>Report Status:</label>
              <select
                name="reportStatus"
                value={formData.reportStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
                <option value="None">None</option>
              </select>
            </div>

            {(formData.reportStatus === "Open" || formData.reportStatus === "Close") && (
              <>
                <div className="form-group">
                  <label>Odometer:</label>
                  <input
                    type="text"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Part Failure:</label>
                  <Select
                    isMulti
                    name="partFailure"
                    options={partFailureOptions}
                    value={partFailureOptions.filter((opt) =>
                      (formData.partFailure || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        partFailure: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select failed parts"
                  />
                </div>

                <div className="form-group">
                  <label>Spares Required:</label>
                  <Select
                    isMulti
                    name="sparesRequired"
                    options={partFailureOptions}
                    value={partFailureOptions.filter((opt) =>
                      (formData.sparesRequired || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        sparesRequired: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select required parts"
                  />
                </div>

                <div className="form-group">
                  <label>Problem Description:</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken:</label>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Complaints Attachment:</label>
                  <input
                    type="file"
                    name="complaintsFile"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>MNVR:</label>
                  <Select
                    isMulti
                    name="mnvr"
                    options={mnvrOptions}
                    value={mnvrOptions.filter((opt) =>
                      (formData.mnvr || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        mnvr: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select MNVR issues"
                  />
                </div>

                <div className="form-group">
                  <label>Power Supply:</label>
                  <Select
                    isMulti
                    name="powerSupply"
                    options={powerSupplyOptions}
                    value={powerSupplyOptions.filter((opt) =>
                      (formData.powerSupply || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        powerSupply: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select power supply issues"
                  />
                </div>

                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="systemDiagnosticsFile"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {formData.reportStatus === "None" && (
              <>
                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="systemDiagnosticsFile"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Updates Section */}
        {formData.serviceType === "Updates" && (
          <>
            <div className="form-group">
              <label>Objective:</label>
              <select
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="LED_FW">LED FW</option>
                <option value="PIS">PIS</option>
                <option value="FIRMWARE">Firmware</option>
                <option value="IPC">IPC</option>
                <option value="SIM_INSTALLATION">SIM Installation</option>
                <option value="ROUTE_SELECTOR">Route Selector Mission</option>
              </select>
            </div>

            <div className="form-group">
              <label>Updates Attachment:</label>
              <input
                type="file"
                name="updatesFile"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Report Status:</label>
              <select
                name="reportStatus"
                value={formData.reportStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
                <option value="None">None</option>
              </select>
            </div>

            {(formData.reportStatus === "Open" || formData.reportStatus === "Close") && (
              <>
                <div className="form-group">
                  <label>Odometer:</label>
                  <input
                    type="text"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Part Failure:</label>
                  <Select
                    isMulti
                    name="partFailure"
                    options={partFailureOptions}
                    value={partFailureOptions.filter((opt) =>
                      (formData.partFailure || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        partFailure: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select failed parts"
                  />
                </div>

                <div className="form-group">
                  <label>Spares Required:</label>
                  <Select
                    isMulti
                    name="sparesRequired"
                    options={partFailureOptions}
                    value={partFailureOptions.filter((opt) =>
                      (formData.sparesRequired || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        sparesRequired: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select required parts"
                  />
                </div>

                <div className="form-group">
                  <label>Problem Description:</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken:</label>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Complaints Attachment:</label>
                  <input
                    type="file"
                    name="complaintsFile"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>MNVR:</label>
                  <Select
                    isMulti
                    name="mnvr"
                    options={mnvrOptions}
                    value={mnvrOptions.filter((opt) =>
                      (formData.mnvr || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        mnvr: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select MNVR issues"
                  />
                </div>

                <div className="form-group">
                  <label>Power Supply:</label>
                  <Select
                    isMulti
                    name="powerSupply"
                    options={powerSupplyOptions}
                    value={powerSupplyOptions.filter((opt) =>
                      (formData.powerSupply || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        powerSupply: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select power supply issues"
                  />
                </div>

                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="systemDiagnosticsFile"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {formData.reportStatus === "None" && (
              <>
                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="systemDiagnosticsFile"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={submitting} className="btn btn-primary mt-3">
          {submitting ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default MTC;