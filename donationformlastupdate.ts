import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Transaction = {
  id: string;
  timestamp: string; // ISO
  dateOfDonation: string; // YYYY-MM-DD
  timeOfDonation: string; // HH:MM
  fullName: string;
  contactNumber: string;
  emailAddress?: string;
  homeAddress?: string;
  donationAmount: number;
  referenceNumber: string;
  gcashNumber: string;
  nameOfPersons?: string; // mass intention
  purposeOfDonation: string;
  intentionType: string;
  status: "pending" | "completed" | "failed";
};

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
  nameOfPersons?: string;
  purposeOfDonation: string;
  intentionType: string;
}

const STORAGE_KEY = "donation_transactions_v1";
const REMINDERS_KEY = "donation_reminders_v1";

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
    nameOfPersons: "",
    purposeOfDonation: "Mass Intentions",
    intentionType: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportRange, setReportRange] = useState<{ from?: string; to?: string }>({});
  const [reminders, setReminders] = useState<Transaction[]>([]); // store transactions with scheduled reminders

  // load saved transactions
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setTransactions(JSON.parse(raw));
      } catch (_) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    const rawR = localStorage.getItem(REMINDERS_KEY);
    if (rawR) {
      try {
        setReminders(JSON.parse(rawR));
      } catch (_) {
        localStorage.removeItem(REMINDERS_KEY);
      }
    }
  }, []);

  // keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }, [reminders]);

  // helper: request notification permission
  const ensureNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
    return false;
  };

  const scheduleReminderFor = async (tx: Transaction) => {
    // only if donation is Mass Intentions and nameOfPersons exists
    if (!tx.nameOfPersons || tx.purposeOfDonation !== "Mass Intentions") return;

    const whenIso = tx.dateOfDonation + "T" + (tx.timeOfDonation || "00:00") + ":00";
    const when = new Date(whenIso);

    // if date invalid or in the past, store as upcoming reminder without scheduling
    if (isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      setReminders(prev => {
        // avoid duplicates
        if (prev.some(r => r.id === tx.id)) return prev;
        return [...prev, tx];
      });
      return;
    }

    const canNotify = await ensureNotificationPermission();
    if (canNotify) {
      const delay = when.getTime() - Date.now();
      // schedule a timeout for current session; also save to reminders list
      const timeoutId = window.setTimeout(() => {
        new Notification("Mass Intention Reminder", {
          body: `Mass for ${tx.nameOfPersons} is scheduled now (${tx.dateOfDonation} ${tx.timeOfDonation}).`,
        });
        // cleanup reminder store if needed
        setReminders(prev => prev.filter(r => r.id !== tx.id));
        window.clearTimeout(timeoutId);
      }, delay);

      setReminders(prev => {
        if (prev.some(r => r.id === tx.id)) return prev;
        return [...prev, tx];
      });
    } else {
      // store the reminder for manual check in-app
      setReminders(prev => {
        if (prev.some(r => r.id === tx.id)) return prev;
        return [...prev, tx];
      });
    }
  };

  // Handle change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Digits only for GCash number
    if (name === "gcashNumber") {
      // allow only digits and up to 11
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 11) return;
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      setErrors(prev => ({ ...prev, [name]: "" }));
      return;
    }

    // donationAmount keep numeric-ish text
    if (name === "donationAmount") {
      // allow digits and decimal
      if (!/^(\d+(\.\d{0,2})?)?$/.test(value) && value !== "") return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Basic validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dateOfDonation) newErrors.dateOfDonation = "Date is required";
    if (!formData.timeOfDonation) newErrors.timeOfDonation = "Time is required";
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.contactNumber) newErrors.contactNumber = "Contact number is required";
    if (!formData.donationAmount || Number(formData.donationAmount) <= 0) newErrors.donationAmount = "Enter valid donation amount";
    if (!formData.referenceNumber) newErrors.referenceNumber = "Reference number is required";
    if (!formData.purposeOfDonation) newErrors.purposeOfDonation = "Purpose is required";
    if (!formData.intentionType) newErrors.intentionType = "Intention type is required";

    // GCash validation: exactly 11 digits
    if (!/^\d{11}$/.test(formData.gcashNumber)) newErrors.gcashNumber = "GCash number must be exactly 11 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save transaction (mock backend) -> persist locally
  const saveTransaction = async (tx: Transaction) => {
    // Example: you can replace this with an axios.post to server
    setTransactions(prev => [tx, ...prev]);
  };

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // simulate payment processing (mock)
    // here you would call your backend or payment gateway
    const amount = Number(parseFloat(formData.donationAmount).toFixed(2));

    const tx: Transaction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      dateOfDonation: formData.dateOfDonation,
      timeOfDonation: formData.timeOfDonation,
      fullName: formData.fullName,
      contactNumber: formData.contactNumber,
      emailAddress: formData.emailAddress,
      homeAddress: formData.homeAddress,
      donationAmount: amount,
      referenceNumber: formData.referenceNumber,
      gcashNumber: formData.gcashNumber,
      nameOfPersons: formData.nameOfPersons,
      purposeOfDonation: formData.purposeOfDonation,
      intentionType: formData.intentionType,
      status: "completed",
    };

    try {
      // Mock "processing"
      await new Promise(res => setTimeout(res, 700));
      await saveTransaction(tx);

      // schedule reminder if applicable
      scheduleReminderFor(tx);

      setSuccessMessage("Donation recorded and payment processed (mock).");
      setTimeout(() => setSuccessMessage(""), 5000);

      // reset form
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
        nameOfPersons: "",
        purposeOfDonation: "Mass Intentions",
        intentionType: "",
      });
      setErrors({});
    } catch (err) {
      setErrors({ general: "Failed to process donation. Try again." });
    }
  };

  const handleCancel = () => {
    if (window.confirm("Cancel and clear the form?")) {
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
        nameOfPersons: "",
        purposeOfDonation: "Mass Intentions",
        intentionType: "",
      });
      setErrors({});
    }
  };

  // Reports: compute totals and filter
  const filteredTransactions = transactions.filter(tx => {
    const from = reportRange.from ? new Date(reportRange.from) : null;
    const to = reportRange.to ? new Date(reportRange.to) : null;
    const txDate = new Date(tx.dateOfDonation);
    if (from && txDate < from) return false;
    if (to && txDate > to) return false;
    return true;
  });

  const totalAll = filteredTransactions.reduce((s, t) => s + t.donationAmount, 0);
  const summaryByPurpose = filteredTransactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.purposeOfDonation] = (acc[t.purposeOfDonation] || 0) + t.donationAmount;
    return acc;
  }, {});

  return (
    <div className="container">
      <div className="form-wrapper">
        {/* Header */}
        <div className="header">
          <button className="back-button" type="button" onClick={() => navigate("/dashboard")}>
            <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="back-text">BACK</span>
          </button>
          <h1 className="title">Donations Form</h1>
        </div>

        {successMessage && <div className="success-message show">{successMessage}</div>}
        {errors.general && <div className="error-message">{errors.general}</div>}

        <form id="donationForm" className="form" onSubmit={handleSubmit}>
          {/* Date/time */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Date of Donation <span className="required">*</span></label>
              <input type="date" name="dateOfDonation" className="input" value={formData.dateOfDonation} onChange={handleChange} />
              <div className="error-message">{errors.dateOfDonation}</div>
            </div>
            <div className="form-group">
              <label className="label">Time of Donation <span className="required">*</span></label>
              <input type="time" name="timeOfDonation" className="input" value={formData.timeOfDonation} onChange={handleChange} />
              <div className="error-message">{errors.timeOfDonation}</div>
            </div>
          </div>

          {/* Name & contact */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Full Name <span className="required">*</span></label>
              <input type="text" name="fullName" className="input" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" />
              <div className="error-message">{errors.fullName}</div>
            </div>
            <div className="form-group">
              <label className="label">Contact Number <span className="required">*</span></label>
              <input type="tel" name="contactNumber" className="input" value={formData.contactNumber} onChange={handleChange} placeholder="Enter your contact number" />
              <div className="error-message">{errors.contactNumber}</div>
            </div>
          </div>

          {/* Email & address */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Email Address</label>
              <input type="email" name="emailAddress" className="input" value={formData.emailAddress} onChange={handleChange} placeholder="Enter email" />
            </div>
            <div className="form-group">
              <label className="label">Home Address</label>
              <input type="text" name="homeAddress" className="input" value={formData.homeAddress} onChange={handleChange} placeholder="Enter home address" />
            </div>
          </div>

          {/* amount & reference */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Donation Amount <span className="required">*</span></label>
              <input type="text" name="donationAmount" className="input" value={formData.donationAmount} onChange={handleChange} placeholder="Enter amount (e.g. 500.00)" />
              <div className="error-message">{errors.donationAmount}</div>
            </div>
            <div className="form-group">
              <label className="label">Reference Number <span className="required">*</span></label>
              <input type="text" name="referenceNumber" className="input" value={formData.referenceNumber} onChange={handleChange} placeholder="Enter reference number" />
              <div className="error-message">{errors.referenceNumber}</div>
            </div>
          </div>

          {/* gcash & intention */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">GCash Number <span className="required">*</span></label>
              <div className="gcash-input">
                <div className="gcash-icon"><span className="gcash-text">G</span></div>
                <input type="text" name="gcashNumber" className="input gcash-number" value={formData.gcashNumber} onChange={handleChange} placeholder="11-digit GCash number" maxLength={11} inputMode="numeric" />
              </div>
              <div className="error-message">{errors.gcashNumber}</div>
            </div>

            <div className="form-group">
              <label className="label">Optional Mass Intention (Name)</label>
              <input type="text" name="nameOfPersons" className="input" value={formData.nameOfPersons} onChange={handleChange} placeholder="Name for mass intention (optional)" />
            </div>
          </div>

          {/* purpose & intention type */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Purpose of Donation <span className="required">*</span></label>
              <select name="purposeOfDonation" className="input" value={formData.purposeOfDonation} onChange={handleChange}>
                <option value="Mass Intentions">Mass Intentions</option>
                <option value="Parish Development / Maintenance">Parish Development / Maintenance</option>
                <option value="Charity Programs (Feeding, Outreach, etc.)">Charity Programs</option>
                <option value="General Parish Fund">General Parish Fund</option>
                <option value="Others (specify)">Others (specify)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Intention Type <span className="required">*</span></label>
              <select name="intentionType" className="input" value={formData.intentionType} onChange={handleChange}>
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

          <div className="button-container">
            <button type="submit" className="submit-button">Submit</button>
            <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>

        {/* Responsive Transactions + Reports */}
        <section style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Transactions</h2>

          {/* Quick filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <label>
              From: <input type="date" onChange={e => setReportRange(r => ({ ...r, from: e.target.value }))} />
            </label>
            <label>
              To: <input type="date" onChange={e => setReportRange(r => ({ ...r, to: e.target.value }))} />
            </label>
            <button onClick={() => { setReportRange({}); }}>Reset</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="report-table-sr" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Name</th>
                  <th>Purpose</th>
                  <th>Amount (PHP)</th>
                  <th>GCash</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length ? (
                  filteredTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td>{tx.fullName}{tx.nameOfPersons ? ` (Intention: ${tx.nameOfPersons})` : ""}</td>
                      <td>{tx.purposeOfDonation} / {tx.intentionType}</td>
                      <td>{tx.donationAmount.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</td>
                      <td>{tx.gcashNumber}</td>
                      <td>{tx.referenceNumber}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 12 }}>No transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12 }}>
            <h3>Report Summary</h3>
            <p>Total (filtered): {totalAll.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</p>
            <ul>
              {Object.keys(summaryByPurpose).length === 0 ? <li>No data</li> : Object.entries(summaryByPurpose).map(([k, v]) => (
                <li key={k}>{k}: {v.toLocaleString(undefined, { style: "currency", currency: "PHP" })}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 12 }}>
            <h3>Upcoming Reminders</h3>
            {reminders.length ? (
              <ul>
                {reminders.map(r => (
                  <li key={r.id}>
                    {r.dateOfDonation} {r.timeOfDonation} — Mass for <strong>{r.nameOfPersons}</strong> (Donor: {r.fullName})
                  </li>
                ))}
              </ul>
            ) : <p>No upcoming reminders.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DonationForm;
