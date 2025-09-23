import React, { useState, FormEvent } from "react";

interface DonationFormData {
  dateOfDonation: string;
  timeOfDonation: string;
  fullName: string;
  contactNumber: string;
  emailAddress?: string;
  homeAddress?: string;
  donationAmount: number;
  referenceNumber: string;
  gcashNumber?: string;
  nameOfPersons?: string;
  purposeOfDonation: string;
  intentionType: string;
}

const DonationForm: React.FC = () => {
  const [formData, setFormData] = useState<DonationFormData>({
    dateOfDonation: "",
    timeOfDonation: "",
    fullName: "",
    contactNumber: "",
    emailAddress: "",
    homeAddress: "",
    donationAmount: 0,
    referenceNumber: "",
    gcashNumber: "09075707357", // default readonly
    nameOfPersons: "",
    purposeOfDonation: "Mass Intentions",
    intentionType: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    let newErrors: Record<string, string> = {};

    if (!formData.dateOfDonation) newErrors.dateOfDonation = "Date is required.";
    if (!formData.timeOfDonation) newErrors.timeOfDonation = "Time is required.";
    if (!formData.fullName) newErrors.fullName = "Full name is required.";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required.";
    if (!formData.donationAmount || formData.donationAmount <= 0)
      newErrors.donationAmount = "Enter a valid amount.";
    if (!formData.referenceNumber)
      newErrors.referenceNumber = "Reference number is required.";
    if (!formData.purposeOfDonation)
      newErrors.purposeOfDonation = "Purpose is required.";
    if (!formData.intentionType)
      newErrors.intentionType = "Intention type is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Donation submitted:", formData);
    alert("Thank you for your donation!");
    setFormData({
      dateOfDonation: "",
      timeOfDonation: "",
      fullName: "",
      contactNumber: "",
      emailAddress: "",
      homeAddress: "",
      donationAmount: 0,
      referenceNumber: "",
      gcashNumber: "09075707357",
      nameOfPersons: "",
      purposeOfDonation: "Mass Intentions",
      intentionType: "",
    });
    setErrors({});
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel?")) {
      setFormData({
        dateOfDonation: "",
        timeOfDonation: "",
        fullName: "",
        contactNumber: "",
        emailAddress: "",
        homeAddress: "",
        donationAmount: 0,
        referenceNumber: "",
        gcashNumber: "09075707357",
        nameOfPersons: "",
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
          <button className="back-button" type="button">
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

        {/* Form */}
        <form className="form" onSubmit={handleSubmit}>
          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Date of Donation *</label>
              <input
                type="date"
                name="dateOfDonation"
                value={formData.dateOfDonation}
                onChange={handleChange}
              />
              {errors.dateOfDonation && (
                <div className="error-message">{errors.dateOfDonation}</div>
              )}
            </div>
            <div className="form-group">
              <label>Time of Donation *</label>
              <input
                type="time"
                name="timeOfDonation"
                value={formData.timeOfDonation}
                onChange={handleChange}
              />
              {errors.timeOfDonation && (
                <div className="error-message">{errors.timeOfDonation}</div>
              )}
            </div>
          </div>

          {/* Full Name & Contact */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                placeholder="Enter your full name"
                onChange={handleChange}
              />
              {errors.fullName && (
                <div className="error-message">{errors.fullName}</div>
              )}
            </div>
            <div className="form-group">
              <label>Contact Number *</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                placeholder="Enter your contact number"
                onChange={handleChange}
              />
              {errors.contactNumber && (
                <div className="error-message">{errors.contactNumber}</div>
              )}
            </div>
          </div>

          {/* Email & Address */}
          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                placeholder="Enter your email address"
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Home Address</label>
              <input
                type="text"
                name="homeAddress"
                value={formData.homeAddress}
                placeholder="Enter your home address"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Donation Amount & Reference */}
          <div className="form-row">
            <div className="form-group">
              <label>Donation Amount *</label>
              <input
                type="number"
                name="donationAmount"
                value={formData.donationAmount || ""}
                placeholder="Enter donation amount"
                onChange={handleChange}
              />
              {errors.donationAmount && (
                <div className="error-message">{errors.donationAmount}</div>
              )}
            </div>
            <div className="form-group">
              <label>Reference Number *</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                placeholder="Enter reference number"
                onChange={handleChange}
              />
              {errors.referenceNumber && (
                <div className="error-message">{errors.referenceNumber}</div>
              )}
            </div>
          </div>

          {/* GCash & Mass Intention */}
          <div className="form-row">
            <div className="form-group">
              <label>GCash Number</label>
              <input
                type="text"
                name="gcashNumber"
                value={formData.gcashNumber}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Optional Mass Intention</label>
              <input
                type="text"
                name="nameOfPersons"
                value={formData.nameOfPersons}
                placeholder="Name of Person/s"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Purpose & Intention */}
          <div className="form-row">
            <div className="form-group">
              <label>Purpose of Donation *</label>
              <select
                name="purposeOfDonation"
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
              {errors.purposeOfDonation && (
                <div className="error-message">{errors.purposeOfDonation}</div>
              )}
            </div>
            <div className="form-group">
              <label>Intention Type *</label>
              <select
                name="intentionType"
                value={formData.intentionType}
                onChange={handleChange}
              >
                <option value="">-- Select --</option>
                <option value="Thanksgiving">Thanksgiving</option>
                <option value="Healing/Recovery">Healing/Recovery</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Others(specify)">Others(specify)</option>
              </select>
              {errors.intentionType && (
                <div className="error-message">{errors.intentionType}</div>
              )}
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
