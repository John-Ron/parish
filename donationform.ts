import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

interface DonationFormData {
  dateOfDonation: string;
  timeOfDonation: string;
  fullName: string;
  contactNumber: string;
  emailAddress?: string;
  homeAddress?: string;
  donationAmount: string;
  referenceNumber: string;
  gcashNumber: string;
  purposeOfDonation: string;
  intentionType: string;
}

const DonationForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<DonationFormData>({
    dateOfDonation: "",
    timeOfDonation: "",
    fullName: "",
    contactNumber: "",
    emailAddress: "",
    homeAddress: "",
    donationAmount: "",
    referenceNumber: "",
    gcashNumber: "",
    purposeOfDonation: "Mass Intentions",
    intentionType: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Handle change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Digits only for GCash number
    if (name === "gcashNumber") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 11) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dateOfDonation)
      newErrors.dateOfDonation = "Date of donation is required";
    if (!formData.timeOfDonation)
      newErrors.timeOfDonation = "Time of donation is required";
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    if (!formData.donationAmount || parseFloat(formData.donationAmount) <= 0)
      newErrors.donationAmount = "Donation amount is required";
    if (!formData.referenceNumber)
      newErrors.referenceNumber = "Reference number is required";
    if (!formData.purposeOfDonation)
      newErrors.purposeOfDonation = "Purpose of donation is required";
    if (!formData.intentionType)
      newErrors.intentionType = "Intention type is required";

    // GCash validation
    if (!/^\d{11}$/.test(formData.gcashNumber)) {
      newErrors.gcashNumber = "GCash number must be exactly 11 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    console.log("✅ Donation submitted:", formData);

    setSuccessMessage("Donation form submitted successfully!");
    setTimeout(() => setSuccessMessage(""), 5000);

    setFormData({
      dateOfDonation: "",
      timeOfDonation: "",
      fullName: "",
      contactNumber: "",
      emailAddress: "",
      homeAddress: "",
      donationAmount: "",
      referenceNumber: "",
      gcashNumber: "",
      purposeOfDonation: "Mass Intentions",
      intentionType: "",
    });
  };

  // Cancel
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel?")) {
      setFormData({
        dateOfDonation: "",
        timeOfDonation: "",
        fullName: "",
        contactNumber: "",
        emailAddress: "",
        homeAddress: "",
        donationAmount: "",
        referenceNumber: "",
        gcashNumber: "",
        purposeOfDonation: "Mass Intentions",
        intentionType: "",
      });
      setErrors({});
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        {/* Header */}
        <div className="header">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            <svg
              className="back-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="back-text">BACK</span>
          </button>
          <h1 className="title">Donations Form</h1>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="success-message show">{successMessage}</div>
        )}

        {/* Form */}
        <form id="donationForm" className="form" onSubmit={handleSubmit}>
          {/* Date and Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">
                Date of Donation <span className="required">*</span>
              </label>
              <input
                type="date"
                name="dateOfDonation"
                className="input"
                value={formData.dateOfDonation}
                onChange={handleChange}
              />
              <div className="error-message">{errors.dateOfDonation}</div>
            </div>
            <div className="form-group">
              <label className="label">
                Time of Donation <span className="required">*</span>
              </label>
              <input
                type="time"
                name="timeOfDonation"
                className="input"
                value={formData.timeOfDonation}
                onChange={handleChange}
              />
              <div className="error-message">{errors.timeOfDonation}</div>
            </div>
          </div>

          {/* Full Name + Contact */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                className="input"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              <div className="error-message">{errors.fullName}</div>
            </div>
            <div className="form-group">
              <label className="label">
                Contact Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                className="input"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter your contact number"
              />
              <div className="error-message">{errors.contactNumber}</div>
            </div>
          </div>

          {/* Email + Address */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                name="emailAddress"
                className="input"
                value={formData.emailAddress}
                onChange={handleChange}
                placeholder="Enter your email address"
              />
            </div>
            <div className="form-group">
              <label className="label">Home Address</label>
              <input
                type="text"
                name="homeAddress"
                className="input"
                value={formData.homeAddress}
                onChange={handleChange}
                placeholder="Enter your home address"
              />
            </div>
          </div>

          {/* Amount + Reference */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">
                Donation Amount <span className="required">*</span>
              </label>
              <input
                type="number"
                name="donationAmount"
                className="input"
                value={formData.donationAmount}
                onChange={handleChange}
                placeholder="Enter donation amount"
              />
              <div className="error-message">{errors.donationAmount}</div>
            </div>
            <div className="form-group">
              <label className="label">
                Reference Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="referenceNumber"
                className="input"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Enter reference number"
              />
              <div className="error-message">{errors.referenceNumber}</div>
            </div>
          </div>

          {/* GCash */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">GCash Number *</label>
              <div className="gcash-input">
                <div className="gcash-icon">
                  <span className="gcash-text">G</span>
                </div>
                <input
                  type="text"
                  name="gcashNumber"
                  className="input gcash-number"
                  value={formData.gcashNumber}
                  onChange={handleChange}
                  placeholder="Enter your 11-digit GCash number"
                  maxLength={11}
                  inputMode="numeric"
                />
              </div>
              <div className="error-message">{errors.gcashNumber}</div>
            </div>
          </div>

          {/* Purpose + Intention */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Purpose of Donation *</label>
              <select
                name="purposeOfDonation"
                className="input"
                value={formData.purposeOfDonation}
                onChange={handleChange}
              >
                <option value="Mass Intentions">Mass Intentions</option>
                <option value="Parish Development / Maintenance">
                  Parish Development / Maintenance
                </option>
                <option value="Charity Programs (Feeding, Outreach, etc.)">
                  Charity Programs (Feeding, Outreach, etc.)
                </option>
                <option value="General Parish Fund">General Parish Fund</option>
                <option value="Others (specify)">Others (specify)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Intention Type *</label>
              <select
                name="intentionType"
                className="input"
                value={formData.intentionType}
                onChange={handleChange}
              >
                <option value="">-- Select --</option>
                <option value="Thanksgiving">Thanksgiving</option>
                <option value="Healing/Recovery">Healing/Recovery</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Others(specify)">Others (specify)</option>
              </select>
              <div className="error-message">{errors.intentionType}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="button-container">
            <button type="submit" className="submit-button">
              Submit
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
