// src/pages/Switch.js
import React, { useState } from "react";
import "./Switch.css";

function SwitchPage() {
  const [formData, setFormData] = useState({
    engineerName: "",
    depo: "",
    fleetNumber: "",
    serviceType: "",
    vehicleStatus: "",
    reportStatus: "",
    objective: "",
    preventiveFile: null,
    odometer: "",
    partFailure: "",
    partFailureImage: null,
    problemDescription: "",
    actionTaken: "",
    requiredSpares: "",
    remarks: "",
    esimId: "",
    imeiNumber: "",
    diagnosticsFile: null,
    deviceInfoFile: null,
    updatesFile: null,
    preventiveSection: {},
  });

  const partFailureOptions = [
    "NONE",
    "MNVR",
    "BDC",
    "POE",
    "FDU",
    "SDU",
    "RDU",
    "IDU",
    "R-CAM",
    "SSD",
    "MIC",
    "WIRING HARNESS",
    "ANTENNA",
    "SPEAKER",
    "S-CAM",
    "APC",
    "FRONT LED",
    "REAR LED",
    "INBUS LED",
    "SIDE LED",
    "PIGTAILS",
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Form submitted successfully!");
  };

  return (
    <div className="switch container mt-5">
      <h2>Switch Page</h2>
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

        {/* Depo */}
        <div className="form-group">
          <label>Depo:</label>
          <select name="depo" value={formData.depo} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Vysarpadi">Vysarpadi</option>
            <option value="Perumbakam">Perumbakam</option>
          </select>
        </div>

        {/* Fleet Number */}
        <div className="form-group">
          <label>Fleet Number:</label>
          <input
            type="text"
            name="fleetNumber"
            value={formData.fleetNumber}
            onChange={handleChange}
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
                    "R-CAM CONNECTOR", "LED PCB"
                  ].map((item) => (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>
                        <input
                          type="radio"
                          name={item}
                          value="OKAY"
                          checked={formData.preventiveSection[item] === "OKAY"}
                          onChange={(e) =>
                            handlePreventiveSection(item, e.target.value)
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="radio"
                          name={item}
                          value="NOT_OKAY"
                          checked={formData.preventiveSection[item] === "NOT_OKAY"}
                          onChange={(e) =>
                            handlePreventiveSection(item, e.target.value)
                          }
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
            {(formData.vehicleStatus === "Open" ||
              formData.vehicleStatus === "Close") && (
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
                  <select
                    name="partFailure"
                    value={formData.partFailure}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {partFailureOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                  <input
                    type="text"
                    name="requiredSpares"
                    value={formData.requiredSpares}
                    onChange={handleChange}
                    required
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
                  <label>E-SIM ID:</label>
                  <input
                    type="text"
                    name="esimId"
                    value={formData.esimId}
                    onChange={handleChange}
                    required
                  />
                </div>
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

            {(formData.reportStatus === "Open" ||
              formData.reportStatus === "Close") && (
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
                  <select
                    name="partFailure"
                    value={formData.partFailure}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {partFailureOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                  <input
                    type="text"
                    name="requiredSpares"
                    value={formData.requiredSpares}
                    onChange={handleChange}
                    required
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
                  <label>E-SIM ID:</label>
                  <input
                    type="text"
                    name="esimId"
                    value={formData.esimId}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                <option value="LED_FW">LED FW</option>
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

            {(formData.vehicleStatus === "Open" ||
              formData.vehicleStatus === "Close") && (
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
                  <select
                    name="partFailure"
                    value={formData.partFailure}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {partFailureOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                  <input
                    type="text"
                    name="requiredSpares"
                    value={formData.requiredSpares}
                    onChange={handleChange}
                    required
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
                  <label>E-SIM ID:</label>
                  <input
                    type="text"
                    name="esimId"
                    value={formData.esimId}
                    onChange={handleChange}
                    required
                  />
                </div>
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
              </>
            )}
          </>
        )}

        {/* Submit */}
        <button type="submit" className="btn btn-primary mt-3">
          Submit
        </button>
      </form>
    </div>
  );
}

export default SwitchPage;
