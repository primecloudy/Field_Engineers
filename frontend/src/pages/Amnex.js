import React, { useState, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import "./Amnex.css";
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";

function OGL() {
  const { user } = useContext(AuthContext);
  const [filteredFleets, setFilteredFleets] = useState([]);
  const [fleetData, setFleetData] = useState([]);
  const [formData, setFormData] = useState({
    engineerName: user?.username || "",
    depo: "",
    fleetNumber: "",
    serviceType: "",
    vehicleStatus: "",
    reportStatus: "",
    objective: "",
    preventiveFile: null,
    odometer: "",
    partFailure: [],
    partFailureImage: null,
    problemDescription: "",
    actionTaken: "",
    requiredSpares: [],  // ✅ Changed from string to array
    remarks: "",
    diagnosticsFile: null,
    deviceInfoFile: null,
    updatesFile: null,
    preventiveSection: {},
    imeiNumber: "",
    technicalSupport: "",      // Yes / No
    tamperingHappened: "",     // Yes / No
    tamperingImage: null,
    missingComponent: [],
    replacedComponent: [],
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
    { value: "R-CAM", label: "R-CAM" },
    { value: "SSD", label: "SSD" },
    { value: "MIC", label: "MIC" },
    { value: "WIRING HARNESS", label: "WIRING HARNESS" },
    { value: "ANTENNA", label: "ANTENNA" },
    { value: "SPEAKER", label: "SPEAKER" },
    { value: "S-CAM", label: "S-CAM" },
    { value: "APC", label: "APC" },
    { value: "PIGTAILS", label: "PIGTAILS" },
  ];

  // ✅ Use the same options for required spares
  const requiredSparesOptions = partFailureOptions;

  // ✅ Load Excel file when component mounts
  useEffect(() => {
    fetch("/MASTER_DATA_ADAIKAL.xlsx")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        console.log("Sheets in File:", workbook.SheetNames);

        const sheet = workbook.Sheets["AMX_MASTER"];
        if (sheet) {
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          console.log("✅ Excel Rows:", jsonData);
          setFleetData(jsonData);
        }
      })
      .catch((err) => console.error("❌ Excel Load Error:", err));
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
      const filtered = fleetData.filter((fleet) =>
        String(fleet["Fleet Number"] || "")
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredFleets(filtered);
    } else {
      setFilteredFleets([]);
    }
  };

  // ✅ Handle selecting a Fleet from dropdown
  const handleSelectFleet = (fleet) => {
    setFormData((prev) => ({
      ...prev,
      fleetNumber: fleet["Fleet Number"],
      depo: fleet["Depot"],
      imeiNumber: fleet["Device ID"] || fleet["IMEI"] || "",
    }));
    setFilteredFleets([]);
  };

  // ✅ Mark all preventive components as OKAY or NOT_OKAY
  const handleMarkAll = (status) => {
    const components = [
      "MIC", "GPS", "GSM", "CAN",
      "BDC COLOR", "BDC TOUCH", "DATA PACKETS"
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
      const partFailureImage = await toBase64(formData.partFailureImage);
      const diagnosticsFile = await toBase64(formData.diagnosticsFile);
      const deviceInfoFile = await toBase64(formData.deviceInfoFile);
      const updatesFile = await toBase64(formData.updatesFile);
      const tamperingImage = await toBase64(formData.tamperingImage);

      // Prepare payload
      const payload = {
        ...formData,
        preventiveFile,
        partFailureImage,
        diagnosticsFile,
        deviceInfoFile,
        updatesFile,
        tamperingImage,   // ✅ Add here
        technicalSupport: formData.technicalSupport,
        tampering: formData.tamperingHappened,
        partFailure: formData.partFailure || [],
        requiredSpares: formData.requiredSpares || [],
        missingComponent: formData.missingComponent || [],
        replacedComponent: formData.replacedComponent || [],
        preventiveSection: formData.preventiveSection || {}
      };

      // Send to Google Apps Script
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzFV8mpXuH06mGFvE7JItnSH436ncwXomAEYk6QPcRVlgaMb7wXpR0CmIBFnU4oftAqVQ/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to submit form");

      const result = await response.json();
      console.log("✅ Form submitted:", result);
      alert("Form submitted successfully!");

      // Reset form
      setFormData({
        engineerName: user?.username || "",
        depo: "",
        fleetNumber: "",
        serviceType: "",
        vehicleStatus: "",
        reportStatus: "",
        objective: "",
        preventiveFile: null,
        odometer: "",
        partFailure: [],
        partFailureImage: null,
        problemDescription: "",
        actionTaken: "",
        requiredSpares: [], // ✅ Reset to array
        remarks: "",
        esimId: "",
        diagnosticsFile: null,
        deviceInfoFile: null,
        updatesFile: null,
        preventiveSection: {},
        imeiNumber: "",
      });

    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="switch container mt-5">
      <h2>Amnex Page</h2>
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
        <div className="form-group" style={{ position: 'relative' }}>
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
              {filteredFleets.map((fleet, index) => (
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
                  {fleet["Fleet Number"]}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Depot */}
        <div className="form-group">
          <label>Depot:</label>
          <input
            type="text"
            name="depo"
            value={formData.depo}
            onChange={handleChange}
            placeholder="Enter Depot Name"
            required
          />
        </div>


        {/* IMEI Number */}
        <div className="form-group">
          <label>IMEI Number:</label>
          <input
            type="text"
            value={formData.imeiNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, imeiNumber: e.target.value }))}
            required
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
                    "MIC", "GPS", "GSM", "CAN",
      "BDC COLOR", "BDC TOUCH", "DATA PACKETS"
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
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="radio"
                          name={item}
                          value="NOT_OKAY"
                          checked={formData.preventiveSection[item] === "NOT_OKAY"}
                          onChange={(e) => handlePreventiveSection(item, e.target.value)}
                          required
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="note">This question requires one response per row</p>
            </div>

            {/* Preventive File */}
            <div className="form-group">
              <label>Preventive Attachment:</label>
              <input
                type="file"
                name="preventiveFile"
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
                <option value="">Select</option>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* Mandatory fields when Open/Close */}
            {(formData.vehicleStatus === "Open" || formData.vehicleStatus === "Close") && (
              <>
                <div className="form-group">
                  <label>Odometer:</label>
                  <input
                    type="text"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleChange}
                    required
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
                  <label>Part Failure Image:</label>
                  <input
                    type="file"
                    name="partFailureImage"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Problem Description:</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken:</label>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* ✅ Changed Required Spares to multi-select dropdown */}
                <div className="form-group">
                  <label>Required Spares:</label>
                  <Select
                    isMulti
                    name="requiredSpares"
                    options={requiredSparesOptions}
                    value={requiredSparesOptions.filter((opt) =>
                      (formData.requiredSpares || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        requiredSpares: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select required spares"
                  />
                </div>
              </>
            )}

            {/* Remarks & Device Info */}
            {(formData.vehicleStatus === "None" || formData.vehicleStatus) && (
              <>
                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>



                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="diagnosticsFile"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Device Information:</label>
                  <input
                    type="file"
                    name="deviceInfoFile"
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Technical Support Required */}
                <div className="form-group">
                  <label>Technical Support Required:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="technicalSupport"
                        value="No"
                        checked={formData.technicalSupport === "No"}
                        onChange={handleChange}
                        required
                      />
                      No
                    </label>
                    <label style={{ marginLeft: "15px" }}>
                      <input
                        type="radio"
                        name="technicalSupport"
                        value="Yes"
                        checked={formData.technicalSupport === "Yes"}
                        onChange={handleChange}
                        required
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {/* Tampering Happened */}
                <div className="form-group">
                  <label>Tampering Happened:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="tamperingHappened"
                        value="No"
                        checked={formData.tamperingHappened === "No"}
                        onChange={handleChange}
                        required
                      />
                      No
                    </label>
                    <label style={{ marginLeft: "15px" }}>
                      <input
                        type="radio"
                        name="tamperingHappened"
                        value="Yes"
                        checked={formData.tamperingHappened === "Yes"}
                        onChange={handleChange}
                        required
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {/* Extra fields if Tampering = Yes */}
                {formData.tamperingHappened === "Yes" && (
                  <>
                    <div className="form-group">
                      <label>Tampering Image:</label>
                      <input
                        type="file"
                        name="tamperingImage"
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Missing Component:</label>
                      <Select
                        isMulti
                        name="missingComponent"
                        options={partFailureOptions}
                        value={partFailureOptions.filter((opt) =>
                          (formData.missingComponent || []).includes(opt.value)
                        )}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            missingComponent: selected ? selected.map((s) => s.value) : [],
                          }))
                        }
                        placeholder="Select missing components"
                      />
                    </div>

                    <div className="form-group">
                      <label>Replaced Component:</label>
                      <Select
                        isMulti
                        name="replacedComponent"
                        options={requiredSparesOptions}
                        value={requiredSparesOptions.filter((opt) =>
                          (formData.replacedComponent || []).includes(opt.value)
                        )}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            replacedComponent: selected ? selected.map((s) => s.value) : [],
                          }))
                        }
                        placeholder="Select replaced components"
                      />
                    </div>
                  </>
                )}

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
                    required
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
                  <label>Part Failure Image:</label>
                  <input
                    type="file"
                    name="partFailureImage"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Problem Description:</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken:</label>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* ✅ Changed Required Spares to multi-select dropdown */}
                <div className="form-group">
                  <label>Required Spares:</label>
                  <Select
                    isMulti
                    name="requiredSpares"
                    options={requiredSparesOptions}
                    value={requiredSparesOptions.filter((opt) =>
                      (formData.requiredSpares || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        requiredSpares: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select required spares"
                  />
                </div>
              </>
            )}

            {(formData.reportStatus === "None" || formData.reportStatus) && (
              <>
                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>



                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="diagnosticsFile"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Device Information:</label>
                  <input
                    type="file"
                    name="deviceInfoFile"
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Technical Support Required */}
                <div className="form-group">
                  <label>Technical Support Required:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="technicalSupport"
                        value="No"
                        checked={formData.technicalSupport === "No"}
                        onChange={handleChange}
                        required
                      />
                      No
                    </label>
                    <label style={{ marginLeft: "15px" }}>
                      <input
                        type="radio"
                        name="technicalSupport"
                        value="Yes"
                        checked={formData.technicalSupport === "Yes"}
                        onChange={handleChange}
                        required
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {/* Tampering Happened */}
                <div className="form-group">
                  <label>Tampering Happened:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="tamperingHappened"
                        value="No"
                        checked={formData.tamperingHappened === "No"}
                        onChange={handleChange}
                        required
                      />
                      No
                    </label>
                    <label style={{ marginLeft: "15px" }}>
                      <input
                        type="radio"
                        name="tamperingHappened"
                        value="Yes"
                        checked={formData.tamperingHappened === "Yes"}
                        onChange={handleChange}
                        required
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {/* Extra fields if Tampering = Yes */}
                {formData.tamperingHappened === "Yes" && (
                  <>
                    <div className="form-group">
                      <label>Tampering Image:</label>
                      <input
                        type="file"
                        name="tamperingImage"
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Missing Component:</label>
                      <Select
                        isMulti
                        name="missingComponent"
                        options={partFailureOptions}
                        value={partFailureOptions.filter((opt) =>
                          (formData.missingComponent || []).includes(opt.value)
                        )}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            missingComponent: selected ? selected.map((s) => s.value) : [],
                          }))
                        }
                        placeholder="Select missing components"
                      />
                    </div>

                    <div className="form-group">
                      <label>Replaced Component:</label>
                      <Select
                        isMulti
                        name="replacedComponent"
                        options={requiredSparesOptions}
                        value={requiredSparesOptions.filter((opt) =>
                          (formData.replacedComponent || []).includes(opt.value)
                        )}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            replacedComponent: selected ? selected.map((s) => s.value) : [],
                          }))
                        }
                        placeholder="Select replaced components"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Updates Section */}
        {formData.serviceType === "Updates" && (
          <>
            <div className="form-group">
              <label>Objectives:</label>
              <select
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="XML">XML</option>
                <option value="Firmware Update">Firmware Update</option>
                <option value="SIM Installation">SIM Installation</option>
                <option value="Software Update">Software Update</option>
                <option value="PIS Update">PIS Update</option>
              </select>
            </div>

            <div className="form-group">
              <label>Updates Attachment:</label>
              <input
                type="file"
                name="updatesFile"
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
                <option value="">Select</option>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
                <option value="None">None</option>
              </select>
            </div>

            {(formData.vehicleStatus === "Open" || formData.vehicleStatus === "Close") && (
              <>
                <div className="form-group">
                  <label>Odometer:</label>
                  <input
                    type="text"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleChange}
                    required
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
                  <label>Part Failure Image:</label>
                  <input
                    type="file"
                    name="partFailureImage"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Problem Description:</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken:</label>
                  <textarea
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* ✅ Changed Required Spares to multi-select dropdown */}
                <div className="form-group">
                  <label>Required Spares:</label>
                  <Select
                    isMulti
                    name="requiredSpares"
                    options={requiredSparesOptions}
                    value={requiredSparesOptions.filter((opt) =>
                      (formData.requiredSpares || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        requiredSpares: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select required spares"
                  />
                </div>
              </>
            )}

            {(formData.vehicleStatus === "None" || formData.vehicleStatus) && (
              <>
                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>



                <div className="form-group">
                  <label>System Diagnostics:</label>
                  <input
                    type="file"
                    name="diagnosticsFile"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Device Information:</label>
                  <input
                    type="file"
                    name="deviceInfoFile"
                    onChange={handleChange}
                    required
                  />
                </div>
                {/* Technical Support Required */}
                <div className="form-group">
                  <label>Technical Support Required:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="technicalSupport"
                        value="No"
                        checked={formData.technicalSupport === "No"}
                        onChange={handleChange}
                        required
                      />
                      No
                    </label>
                    <label style={{ marginLeft: "15px" }}>
                      <input
                        type="radio"
                        name="technicalSupport"
                        value="Yes"
                        checked={formData.technicalSupport === "Yes"}
                        onChange={handleChange}
                        required
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {/* Tampering Happened */}
                <div className="form-group">
                  <label>Tampering Happened:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="tamperingHappened"
                        value="No"
                        checked={formData.tamperingHappened === "No"}
                        onChange={handleChange}
                        required
                      />
                      No
                    </label>
                    <label style={{ marginLeft: "15px" }}>
                      <input
                        type="radio"
                        name="tamperingHappened"
                        value="Yes"
                        checked={formData.tamperingHappened === "Yes"}
                        onChange={handleChange}
                        required
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {/* Extra fields if Tampering = Yes */}
                {formData.tamperingHappened === "Yes" && (
                  <>
                    <div className="form-group">
                      <label>Tampering Image:</label>
                      <input
                        type="file"
                        name="tamperingImage"
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Missing Component:</label>
                      <Select
                        isMulti
                        name="missingComponent"
                        options={partFailureOptions}
                        value={partFailureOptions.filter((opt) =>
                          (formData.missingComponent || []).includes(opt.value)
                        )}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            missingComponent: selected ? selected.map((s) => s.value) : [],
                          }))
                        }
                        placeholder="Select missing components"
                      />
                    </div>

                    <div className="form-group">
                      <label>Replaced Component:</label>
                      <Select
                        isMulti
                        name="replacedComponent"
                        options={requiredSparesOptions}
                        value={requiredSparesOptions.filter((opt) =>
                          (formData.replacedComponent || []).includes(opt.value)
                        )}
                        onChange={(selected) =>
                          setFormData((prev) => ({
                            ...prev,
                            replacedComponent: selected ? selected.map((s) => s.value) : [],
                          }))
                        }
                        placeholder="Select replaced components"
                      />
                    </div>
                  </>
                )}
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

export default OGL;