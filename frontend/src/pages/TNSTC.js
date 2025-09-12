// src/pages/TNSTC.js
import React, { useState, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import "./TNSTC.css";
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";

function TNSTC() {
  const { user } = useContext(AuthContext);
  const [filteredFleets, setFilteredFleets] = useState([]);
  const [fleetData, setFleetData] = useState([]);
  const [formData, setFormData] = useState({
    engineerName: user?.username || "",
    field: "",
    fleetNumber: "",
    depo: "",
    imeiNumber: "",
    odometer: "",
    serviceType: "",
    reportStatus: "",
    objective: "",
    partFailure: [],
    spareReplaced: [],
    sparesRequired: [],
    problemDescription: "",
    actionTaken: "",
    remarks: "",
    preventiveFile: null,
    complaintsFile: null,
    updatesFile: null,
    partFailureImage: null,
    referenceFile1: null,
    referenceFile2: null,
    preventiveSection: {},
  });
  const [submitting, setSubmitting] = useState(false);

  const partFailureOptions = [
    { value: "NONE", label: "NONE" },
    { value: "MNVR", label: "MNVR" },
    { value: "BDC", label: "BDC" },
    { value: "POE", label: "POE" },
    { value: "IDU", label: "IDU" },
    { value: "FDU CONTROL CARD", label: "FDU CONTROL CARD" },
    { value: "FDU SMALL CARD", label: "FDU SMALL CARD" },
    { value: "FDU 1ST CARD", label: "FDU 1ST CARD" },
    { value: "FDU 2ND CARD", label: "FDU 2ND CARD" },
    { value: "SDU CONTROL CARD", label: "SDU CONTROL CARD" },
    { value: "SDU 1ST CARD", label: "SDU 1ST CARD" },
    { value: "SDU 2ND CARD", label: "SDU 2ND CARD" },
    { value: "RDU CONTROL CARD", label: "RDU CONTROL CARD" },
    { value: "RDU 1ST CARD", label: "RDU 1ST CARD" },
    { value: "RDU 2ND CARD", label: "RDU 2ND CARD" },
    { value: "S-CAM", label: "S-CAM" },
    { value: "R-CAM", label: "R-CAM" },
    { value: "SSD", label: "SSD" },
    { value: "MIC", label: "MIC" },
    { value: "RJ45", label: "RJ45" },
    { value: "FRC", label: "FRC" },
    { value: "POWER PIC", label: "POWER PIC" },
  ];

  // Use the same options for Spare Replaced and Spares Required
  const spareOptions = [...partFailureOptions];

  const objectiveOptions = [
    { value: "LED_FW", label: "LED FW 1.3.0" },
    { value: "MNVR_FW", label: "MNVR FW 2.1" },
    { value: "FIRMWARE", label: "FIRMWARE 38" },
    { value: "SOFTWARE_UPDATE", label: "SOFTWARE UPDATE" },
  ];

  // ✅ Load Excel file when component mounts - UPDATED TO READ FROM M_and_C SHEET
  useEffect(() => {
    fetch("/MASTER_DATA_ADAIKAL.xlsx")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        console.log("Sheets in File:", workbook.SheetNames);

        // Read from M_and_C sheet instead of TNSTC_MASTER
        const sheet = workbook.Sheets["M_and_C"];
        if (sheet) {
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          console.log("✅ Excel Rows:", jsonData);
          
          // Extract headers and data
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          // Map to consistent column names
          const formattedData = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              if (header) {
                // Normalize header names for consistent access
                const normalizedHeader = header.trim().toLowerCase();
                if (normalizedHeader.includes('fleet')) {
                  obj.fleetNumber = row[index] || '';
                } else if (normalizedHeader.includes('depot') || normalizedHeader.includes('depo')) {
                  obj.depot = row[index] || '';
                } else if (normalizedHeader.includes('device') || normalizedHeader.includes('imei')) {
                  obj.imei = row[index] || '';
                } else {
                  obj[header] = row[index] || '';
                }
              }
            });
            return obj;
          });
          
          setFleetData(formattedData);
          console.log("✅ Formatted Fleet Data:", formattedData);
        } else {
          console.error("❌ M_and_C sheet not found in Excel file");
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
        String(fleet.fleetNumber || "")
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredFleets(filtered);
    } else {
      setFilteredFleets([]);
    }
  };

  // ✅ Handle selecting a Fleet from dropdown - UPDATED TO SET DEPOT
  const handleSelectFleet = (fleet) => {
    setFormData((prev) => ({
      ...prev,
      fleetNumber: fleet.fleetNumber || "",
      depo: fleet.depot || "",
      imeiNumber: fleet.imei || "",
    }));
    setFilteredFleets([]);
  };

  // ✅ Mark all preventive components as OKAY or NOT_OKAY
  const handleMarkAll = (status) => {
    const components = [
      "R-CAM", "FDU", "SDU", "RDU", "IDU", "MIC", "GPS", "GSM", "CAN",
      "M-ANN", "BDC COLOR", "BDC TOUCH"
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
      const partFailureImage = await toBase64(formData.partFailureImage);
      const referenceFile1 = await toBase64(formData.referenceFile1);
      const referenceFile2 = await toBase64(formData.referenceFile2);

      // Prepare payload
      const payload = {
        ...formData,
        preventiveFile,
        complaintsFile,
        updatesFile,
        partFailureImage,
        referenceFile1,
        referenceFile2,
        partFailure: formData.partFailure || [],
        spareReplaced: formData.spareReplaced || [],
        sparesRequired: formData.sparesRequired || [],
        preventiveSection: formData.preventiveSection || {}
      };

      // Send to Google Apps Script (replace with your TNSTC endpoint)
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbw9op9Jl7UjYy4t7gxBCazWXs7phEuvb9MWEfiovtUkMd_mQ9TXZXQJU01v4LuaKSFcYA/exec",
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
        field: "",
        fleetNumber: "",
        depo: "",
        imeiNumber: "",
        odometer: "",
        serviceType: "",
        reportStatus: "",
        objective: "",
        partFailure: [],
        spareReplaced: [],
        sparesRequired: [],
        problemDescription: "",
        actionTaken: "",
        remarks: "",
        preventiveFile: null,
        complaintsFile: null,
        updatesFile: null,
        partFailureImage: null,
        referenceFile1: null,
        referenceFile2: null,
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
    <div className="tnstc container mt-5">
      <h2>TNSTC Page</h2>
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

        {/* Field Selection */}
        <div className="form-group">
          <label>Field:</label>
          <select
            name="field"
            value={formData.field}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Madurai">Madurai</option>
            <option value="Coimbatore">Coimbatore</option>
          </select>
        </div>

         {/* Fleet Number */}
        <div className="form-group">
          <label>Fleet Number:</label>
          <input
            type="text"
            value={formData.fleetNumber}
            onChange={handleFleetNumberChange}
            placeholder="Type Fleet Number"
            required
          />
          {filteredFleets.length > 0 && (
            <ul className="dropdown">
              {filteredFleets.map((fleet, index) => (
                <li key={index} onClick={() => handleSelectFleet(fleet)}>
                  {fleet.fleetNumber} - {fleet.depot || "N/A"}
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
            value={formData.depo} 
            readOnly 
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
            required
          />
        </div>

        {/* Odometer */}
        <div className="form-group">
          <label>Odometer:</label>
          <input
            type="text"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
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
                    "M-ANN", "BDC COLOR", "BDC TOUCH"
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
                  />
                </div>

                <div className="form-group">
                  <label>Spare Replaced:</label>
                  <Select
                    isMulti
                    name="spareReplaced"
                    options={spareOptions}
                    value={spareOptions.filter((opt) =>
                      (formData.spareReplaced || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        spareReplaced: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select replaced parts"
                  />
                </div>

                <div className="form-group">
                  <label>Spares Required:</label>
                  <Select
                    isMulti
                    name="sparesRequired"
                    options={spareOptions}
                    value={spareOptions.filter((opt) =>
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
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Reference Attachment 1:</label>
                  <input
                    type="file"
                    name="referenceFile1"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Reference Attachment 2:</label>
                  <input
                    type="file"
                    name="referenceFile2"
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
                  />
                </div>

                <div className="form-group">
                  <label>Spare Replaced:</label>
                  <Select
                    isMulti
                    name="spareReplaced"
                    options={spareOptions}
                    value={spareOptions.filter((opt) =>
                      (formData.spareReplaced || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        spareReplaced: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select replaced parts"
                  />
                </div>

                <div className="form-group">
                  <label>Spares Required:</label>
                  <Select
                    isMulti
                    name="sparesRequired"
                    options={spareOptions}
                    value={spareOptions.filter((opt) =>
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
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Reference Attachment 1:</label>
                  <input
                    type="file"
                    name="referenceFile1"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Reference Attachment 2:</label>
                  <input
                    type="file"
                    name="referenceFile2"
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
                <option value="LED_FW">LED FW 1.3.0</option>
                <option value="MNVR_FW">MNVR FW 2.1</option>
                <option value="FIRMWARE">FIRMWARE 38</option>
                <option value="SOFTWARE_UPDATE">SOFTWARE UPDATE</option>
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
                    "M-ANN", "BDC COLOR", "BDC TOUCH"
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
                  />
                </div>

                <div className="form-group">
                  <label>Spare Replaced:</label>
                  <Select
                    isMulti
                    name="spareReplaced"
                    options={spareOptions}
                    value={spareOptions.filter((opt) =>
                      (formData.spareReplaced || []).includes(opt.value)
                    )}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        spareReplaced: selected ? selected.map((s) => s.value) : [],
                      }))
                    }
                    placeholder="Select replaced parts"
                  />
                </div>

                <div className="form-group">
                  <label>Spares Required:</label>
                  <Select
                    isMulti
                    name="sparesRequired"
                    options={spareOptions}
                    value={spareOptions.filter((opt) =>
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
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Reference Attachment 1:</label>
                  <input
                    type="file"
                    name="referenceFile1"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Reference Attachment 2:</label>
                  <input
                    type="file"
                    name="referenceFile2"
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

export default TNSTC;