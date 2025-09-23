import React, { useState, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import "./OGL.css";
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";

function OGL() {
  const { user } = useContext(AuthContext);
  const [filteredFleets, setFilteredFleets] = useState([]);
  const [fleetData, setFleetData] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    engineerName: user?.username || "",
    depo: "",
    fleetNumber: "",
    imeiNumber: "",
    serviceType: "",
    // Preventive specific
    preventiveSection: {},
    vehicleStatus: "",
    // Complaints specific
    reportStatus: "",
    // Updates specific
    objective: "",
    updateStatus: "",
    reasonForPending: "",
    // Common fields
    odometer: "",
    partFailure: [],
    partFailureImage: null,
    partReplaceImage: null,
    complaintCloseImage: null,
    problemDescription: "",
    actionTaken: "",
    requiredSpares: [],
    replaceSpares: [],
    remarks: "",
    diagnosticsFile: null,
    deviceInfoFile: null,
    updatesFile: null,
    preventiveFile: null,
    technicalSupport: "",
    tamperingHappened: "",
    tamperingImage: null,
    missingComponent: [],
    replacedComponent: [],
  });

  // Options for dropdowns
  const partFailureOptions = [
    { value: "NONE", label: "NONE" },
    { value: "BDC", label: "BDC" },
    { value: "S-CAM", label: "S-CAM" },
    { value: "R-CAM", label: "R-CAM" },
    { value: "POE SWITCH", label: "POE SWITCH" },
    { value: "SPEAKER", label: "SPEAKER" },
    { value: "MIC", label: "MIC" },
    { value: "FRONT LED FIRST PCB", label: "FRONT LED FIRST PCB" },
    { value: "FRONT LED SECOND PCB", label: "FRONT LED SECOND PCB" },
    { value: "FRONT LED LAST PCB", label: "FRONT LED LAST PCB" },
    { value: "REAR LED FIRST PCB", label: "REAR LED FIRST PCB" },
    { value: "REAR LED SECOND PCB", label: "REAR LED SECOND PCB" },
    { value: "SIDE LED FIRST PCB", label: "SIDE LED FIRST PCB" },
    { value: "SIDE LED SECOND PCB", label: "SIDE LED SECOND PCB" },
    { value: "INBUS LED FIRST PCB", label: "INBUS LED FIRST PCB" },
    { value: "INBUS LED SECOND PCB", label: "INBUS LED SECOND PCB" },
    { value: "CONTROL CARD", label: "CONTROL CARD" },
    { value: "POWER CARD", label: "POWER CARD" },
    { value: "FRC", label: "FRC" },
    { value: "LED POWER LOOP PICTILE", label: "LED POWER LOOP PICTILE" },
    { value: "POWER CARD CONNECTOR", label: "POWER CARD CONNECTOR" },
    { value: "CONTROL CARD CONNECTOR", label: "CONTROL CARD CONNECTOR" },
    { value: "RJ45 CONNECTOR DAMAGE", label: "RJ45 CONNECTOR DAMAGE" },
    { value: "MOTHER BOARD", label: "MOTHER BOARD" },
    { value: "BASE BOARD", label: "BASE BOARD" },
    { value: "12V CONVERTER", label: "12V CONVERTER" },
    { value: "UFL", label: "UFL" },
    { value: "ANTENNA", label: "ANTENNA" },
    { value: "MRS CONNECTOR", label: "MRS CONNECTOR" },
    { value: "HARDDISK", label: "HARDDISK" },
    { value: "SIM CARD", label: "SIM CARD" },
    { value: "SATA CABLE", label: "SATA CABLE" },
    { value: "HARDDISK POWER PICTILE", label: "HARDDISK POWER PICTILE" },
    { value: "VGA PICTILE", label: "VGA PICTILE" },
    { value: "UART PICTILE", label: "UART PICTile" },
    { value: "6 PIN TO 4 PIN PICTILE", label: "6 PIN TO 4 PIN PICTILE" },
    { value: "EC QUECTEL MODEM", label: "EC QUECTEL MODEM" },
    { value: "LITHIUM BATTERY", label: "LITHIUM BATTERY" },
    { value: "3AMP FUSE", label: "3AMP FUSE" },
    { value: "BOX END BULCONNECTOR MALE", label: "BOX END BULCONNECTOR MALE" },
    { value: "BOX END BULCONNECTOR FEMALE", label: "BOX END BULCONnECTOR FEMALE" },
    { value: "AMPLIFIER", label: "AMPLIFIER" },
    { value: "CAN MODULE", label: "CAN MODULE" },
    { value: "BOX END MRS CONNECTOR", label: "BOX END MRS CONNECTOR" },
    { value: "BOX END INDICATION PICTILE", label: "BOX END INDICATION PICTILE" },
  ];

  const requiredSparesOptions = partFailureOptions;

  // Load Excel file when component mounts
  useEffect(() => {
    fetch("/MASTER_DATA_ADAIKAL.xlsx")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets["OGL_MASTER"];
        if (sheet) {
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          setFleetData(jsonData);
        }
      })
      .catch((err) => console.error("Excel Load Error:", err));
  }, []);

  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({ ...prev, engineerName: user.username }));
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle preventive section changes
  const handlePreventiveSection = (field, value) => {
    setFormData({
      ...formData,
      preventiveSection: { ...formData.preventiveSection, [field]: value },
    });
  };

  // Mark all preventive components as OKAY or NOT_OKAY
  const handleMarkAll = (status) => {
    const components = [
      "CAM STREAMING",
      "CAMERA DATE & TIME",
      "REAR CAM POPUP",
      "FDU",
      "SDU",
      "RDU",
      "IDU",
      "ALL LED ROUTE UPDATE",
      "MIC",
      "GPS",
      "GSM",
      "CAN",
      "M-ANN",
      "BDC COLOR",
      "BDC TOUCH",
      "USB DETECTING",
      "PLAYBACK",
      "LED PCB",
      "PREOPLE COUNT CAM COUNTING",
      "DATA PACKET",
      "FIRMWARE VERSION IN CURRENT UPDATE",
      "PIS IN CURRENT VERSION",
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

  // Handle typing Fleet Number
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

  // Handle selecting a Fleet from dropdown
  const handleSelectFleet = (fleet) => {
    setFormData((prev) => ({
      ...prev,
      fleetNumber: fleet["Fleet Number"],
      depo: fleet["Depot"],
      imeiNumber: fleet["Device ID"] || fleet["IMEI"] || "",
    }));
    setFilteredFleets([]);
  };

  // Handle form submit
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
      const partReplaceImage = await toBase64(formData.partReplaceImage);
      const complaintCloseImage = await toBase64(formData.complaintCloseImage);
      const diagnosticsFile = await toBase64(formData.diagnosticsFile);
      const deviceInfoFile = await toBase64(formData.deviceInfoFile);
      const updatesFile = await toBase64(formData.updatesFile);
      const tamperingImage = await toBase64(formData.tamperingImage);

      // Prepare payload
      const payload = {
        ...formData,
        preventiveFile,
        partFailureImage,
        partReplaceImage,
        complaintCloseImage,
        diagnosticsFile,
        deviceInfoFile,
        updatesFile,
        tamperingImage,
        partFailure: formData.partFailure || [],
        requiredSpares: formData.requiredSpares || [],
        replaceSpares: formData.replaceSpares || [],
        missingComponent: formData.missingComponent || [],
        replacedComponent: formData.replacedComponent || [],
        preventiveSection: formData.preventiveSection || {}
      };

      // Send to Google Apps Script
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx9C4ojsxx6D9JaeYhPVZUecCHEPRooeJiXnbLcFjwL9fH0e8Uy1CWxrsL-fpC06E5aFQ/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to submit form");

      const result = await response.json();
      alert("Form submitted successfully!");

      // Reset form
      setFormData({
        engineerName: user?.username || "",
        depo: "",
        fleetNumber: "",
        imeiNumber: "",
        serviceType: "",
        preventiveSection: {},
        vehicleStatus: "",
        reportStatus: "",
        objective: "",
        updateStatus: "",
        reasonForPending: "",
        odometer: "",
        partFailure: [],
        partFailureImage: null,
        partReplaceImage: null,
        complaintCloseImage: null,
        problemDescription: "",
        actionTaken: "",
        requiredSpares: [],
        replaceSpares: [],
        remarks: "",
        diagnosticsFile: null,
        deviceInfoFile: null,
        updatesFile: null,
        preventiveFile: null,
        technicalSupport: "",
        tamperingHappened: "",
        tamperingImage: null,
        missingComponent: [],
        replacedComponent: [],
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Render common fields for Open status
  const renderOpenFields = () => (
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
  );

  // Render common fields for Close status (Preventive)
  const renderPreventiveCloseFields = () => (
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

      {/* Replace Spares field for Close status */}
      <div className="form-group">
        <label>Replace Spares:</label>
        <Select
          isMulti
          name="replaceSpares"
          options={requiredSparesOptions}
          value={requiredSparesOptions.filter((opt) =>
            (formData.replaceSpares || []).includes(opt.value)
          )}
          onChange={(selected) =>
            setFormData((prev) => ({
              ...prev,
              replaceSpares: selected ? selected.map((s) => s.value) : [],
            }))
          }
          placeholder="Select replaced spares"
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
  );

  // Render common fields for Close status (Complaints)
  const renderComplaintsCloseFields = () => (
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

      {/* Part Replace Image for Complaints Close status */}
      <div className="form-group">
        <label>Part Replace Image:</label>
        <input
          type="file"
          name="partReplaceImage"
          onChange={handleChange}
          required
        />
      </div>

      {/* Complaint Close Image for Complaints Close status */}
      <div className="form-group">
        <label>Complaint Close Image:</label>
        <input
          type="file"
          name="complaintCloseImage"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Replace Spares:</label>
        <Select
          isMulti
          name="replaceSpares"
          options={requiredSparesOptions}
          value={requiredSparesOptions.filter((opt) =>
            (formData.replaceSpares || []).includes(opt.value)
          )}
          onChange={(selected) =>
            setFormData((prev) => ({
              ...prev,
              replaceSpares: selected ? selected.map((s) => s.value) : [],
            }))
          }
          placeholder="Select replaced spares"
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
  );

  // Render common fields for None status
  const renderNoneFields = () => (
    <div className="form-group">
      <label>Remarks:</label>
      <textarea
        name="remarks"
        value={formData.remarks}
        onChange={handleChange}
        required
      ></textarea>
    </div>
  );

  // Render common technical and tampering fields
  const renderTechnicalAndTamperingFields = () => (
    <>
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
  );

  // Render preventive section
  const renderPreventiveSection = () => (
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
              <th>NOT APPLICABLE</th>
            </tr>
          </thead>
          <tbody>
            {[
              "CAM STREAMING",
              "CAMERA DATE & TIME",
              "REAR CAM POPUP",
              "FDU",
              "SDU",
              "RDU",
              "IDU",
              "ALL LED ROUTE UPDATE",
              "MIC",
              "GPS",
              "GSM",
              "CAN",
              "M-ANN",
              "BDC COLOR",
              "BDC TOUCH",
              "USB DETECTING",
              "PLAYBACK",
              "LED PCB",
              "PREOPLE COUNT CAM COUNTING",
              "DATA PACKET",
              "FIRMWARE VERSION IN CURRENT UPDATE",
              "PIS IN CURRENT VERSION",
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
                <td>
                  <input
                    type="radio"
                    name={item}
                    value="NOT_APPLICABLE"
                    checked={formData.preventiveSection[item] === "NOT_APPLICABLE"}
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

      {formData.vehicleStatus === "Open" && (
        <>
          {renderOpenFields()}
          {renderNoneFields()}
          {renderTechnicalAndTamperingFields()}
        </>
      )}

      {formData.vehicleStatus === "Close" && (
        <>
          {renderPreventiveCloseFields()}
          {renderNoneFields()}
          {renderTechnicalAndTamperingFields()}
        </>
      )}

      {formData.vehicleStatus === "None" && (
        <>
          {renderNoneFields()}
          {renderTechnicalAndTamperingFields()}
        </>
      )}
    </>
  );

  // Render complaints section
  const renderComplaintsSection = () => (
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
        </select>
      </div>

      {formData.reportStatus === "Open" && (
        <>
          {renderOpenFields()}
          {renderNoneFields()}
          {renderTechnicalAndTamperingFields()}
        </>
      )}

      {formData.reportStatus === "Close" && (
        <>
          {renderComplaintsCloseFields()}
          {renderNoneFields()}
          {renderTechnicalAndTamperingFields()}
        </>
      )}
    </>
  );

  // Render updates section
  const renderUpdatesSection = () => (
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

      <div className="form-group">
        <label>Update Status:</label>
        <select
          name="updateStatus"
          value={formData.updateStatus}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Updated">Updated</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {formData.updateStatus === "Pending" && (
        <div className="form-group">
          <label>Reason for Pending:</label>
          <textarea
            name="reasonForPending"
            value={formData.reasonForPending}
            onChange={handleChange}
            required
          ></textarea>
        </div>
      )}

      {renderNoneFields()}
      {renderTechnicalAndTamperingFields()}
    </>
  );

  return (
    <div className="switch container mt-5">
      <h2>OGL Page</h2>
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

        {/* Render appropriate section based on service type */}
        {formData.serviceType === "Preventive" && renderPreventiveSection()}
        {formData.serviceType === "Complaints" && renderComplaintsSection()}
        {formData.serviceType === "Updates" && renderUpdatesSection()}

        {/* Submit Button */}
        <button type="submit" disabled={submitting} className="btn btn-primary mt-3">
          {submitting ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default OGL;