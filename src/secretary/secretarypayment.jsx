import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faReceipt } from "@fortawesome/free-solid-svg-icons";
import "./secretarypayment.css";

const SecretaryPayment = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sacramentFilter, setSacramentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // ✅ new category filter

  const [formValues, setFormValues] = useState({
    totalAmount: 0,
    amountPaid: 0
  });

  const [payments, setPayments] = useState([
    {
      id: 1001,
      firstName: "Maria",
      lastName: "Santos",
      sacramentType: "Baptism",
      category: "Ministerial Services", // ✅ added category
      totalAmount: 2500.0,
      amountPaid: 1500.0,
      balance: 1000.0,
      status: "partial",
      createdAt: "2025-04-20T08:30:00",
      receiptNumber: "RCP-2025-0001"
    },
    {
      id: 1002,
      firstName: "Juan",
      lastName: "Cruz",
      sacramentType: "Wedding",
      category: "Collections", // ✅ added category
      totalAmount: 10000.0,
      amountPaid: 10000.0,
      balance: 0.0,
      status: "paid",
      createdAt: "2025-04-22T14:45:00",
      receiptNumber: "RCP-2025-0002"
    }
  ]);

  const totalIncome = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

  const toggleModal = (payment = null) => {
    if (payment) {
      setIsEditing(true);
      setCurrentPayment(payment);
      setFormValues({
        totalAmount: payment.totalAmount,
        amountPaid: payment.amountPaid
      });
    } else {
      setIsEditing(false);
      setCurrentPayment(null);
      setFormValues({ totalAmount: 0, amountPaid: 0 });
    }
    setShowModal(!showModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: parseFloat(value) || 0 });
  };

  const calculateChange = () => {
    if (formValues.amountPaid > formValues.totalAmount) {
      return (formValues.amountPaid - formValues.totalAmount).toFixed(2);
    }
    return "0.00";
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSacramentFilterChange = (e) => setSacramentFilter(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const handleCategoryFilterChange = (e) => setCategoryFilter(e.target.value); // ✅

  // ✅ now filter also checks category
  const filteredPayments = payments.filter((payment) => {
    const fullName = `${payment.firstName} ${payment.lastName}`.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSacrament = sacramentFilter === "" || payment.sacramentType === sacramentFilter;
    const matchesStatus = statusFilter === "" || payment.status === statusFilter;
    const matchesCategory = categoryFilter === "" || payment.category === categoryFilter;

    return matchesSearch && matchesSacrament && matchesStatus && matchesCategory;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const totalAmount = parseFloat(formData.get("totalAmount"));
    const amountPaid = parseFloat(formData.get("amountPaid"));
    const balance = totalAmount - amountPaid;

    let status = "unpaid";
    if (amountPaid >= totalAmount) status = "paid";
    else if (amountPaid > 0) status = "partial";

    let receiptNumber = formData.get("receiptNumber");
    if (!isEditing) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const count = payments.length + 1;
      receiptNumber = `RCP-${year}-${String(count).padStart(4, "0")}`;
    }

    const paymentData = {
      id: isEditing ? currentPayment.id : Date.now(),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      sacramentType: formData.get("sacramentType"),
      category: formData.get("category"), // ✅ added category field
      totalAmount,
      amountPaid,
      balance,
      status,
      createdAt: isEditing ? currentPayment.createdAt : new Date().toISOString(),
      receiptNumber
    };

    if (isEditing) {
      setPayments(payments.map((p) => (p.id === currentPayment.id ? paymentData : p)));
    } else {
      setPayments([...payments, paymentData]);
    }

    toggleModal();
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-paid-spm";
      case "partial":
        return "status-partial-spm";
      case "unpaid":
        return "status-unpaid-spm";
      default:
        return "";
    }
  };

  return (
    <div className="payment-container-spm">
      <div className="title-container-spm">
        <h1 className="title-spm">PAYMENT MANAGEMENT</h1>
        <div className="total-income-container-spm">
          <span className="total-income-label-spm">Total Income:</span>
          <span className="total-income-value-spm">{formatCurrency(totalIncome)}</span>
        </div>
      </div>

      <div className="payment-actions-spm">
        <div className="search-bar-spm">
          <input
            type="text"
            placeholder="Search by name or receipt number"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-spm" />
        </div>

        <div className="filter-add-container-spm">
          <select className="filter-select-spm" value={sacramentFilter} onChange={handleSacramentFilterChange}>
            <option value="">All Sacraments</option>
            <option value="Baptism">Baptism</option>
            <option value="First Communion">First Communion</option>
            <option value="Confirmation">Confirmation</option>
            <option value="Wedding">Wedding</option>
            <option value="Funeral">Funeral</option>
            <option value="Mass Intention">Mass Intention</option>
          </select>

          <select className="filter-select-spm" value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* ✅ New Category Filter */}
          <select className="filter-select-spm" value={categoryFilter} onChange={handleCategoryFilterChange}>
            <option value="">All Categories</option>
            <option value="Ministerial Services">Ministerial Services</option>
            <option value="Collections">Collections</option>
            <option value="Other Income">Other Income</option>
            <option value="Donation from Special Projects">Donation from Special Projects</option>
            <option value="Other Church Income/Donations Individuals">
              Other Church Income/Donations Individuals
            </option>
            <option value="Foreign & Local Fundings Assistance">Foreign & Local Fundings Assistance</option>
            <option value="Pontifical Collections">Pontifical Collections</option>
            <option value="National Collections">National Collections</option>
            <option value="Diocesan Collections">Diocesan Collections</option>
            <option value="Priest Honoraria">Priest Honoraria</option>
            <option value="Rectory Expenses">Rectory Expenses</option>
            <option value="Regular Expenses">Regular Expenses</option>
            <option value="Church Supplies & Other Expenses">Church Supplies & Other Expenses</option>
            <option value="Repair & Maintenance">Repair & Maintenance</option>
            <option value="Honorarium">Honorarium</option>
            <option value="Pastoral Program">Pastoral Program</option>
            <option value="Special Project Donation">Special Project Donation</option>
            <option value="Remittance to the Curia">Remittance to the Curia</option>
            <option value="Cash Advances (Receivables)">Cash Advances (Receivables)</option>
          </select>

          <button className="add-btn-spm" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="payment-table-spm">
        <thead>
          <tr>
            <th>Receipt #</th>
            <th>Name</th>
            <th>Sacrament</th>
            <th>Category</th> {/* ✅ new column */}
            <th>Total Amount</th>
            <th>Amount Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.receiptNumber}</td>
                <td>{`${payment.firstName} ${payment.lastName}`}</td>
                <td>{payment.sacramentType}</td>
                <td>{payment.category}</td> {/* ✅ show category */}
                <td>{formatCurrency(payment.totalAmount)}</td>
                <td>{formatCurrency(payment.amountPaid)}</td>
                <td>{formatCurrency(payment.balance)}</td>
                <td>
                  <span className={`status-badge-spm ${getStatusClass(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
                <td>{formatDateTime(payment.createdAt)}</td>
                <td>
                  <button className="spm-details" onClick={() => toggleModal(payment)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="no-results-spm">No payments found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Payment Modal */}
      {showModal && (
        <div className="payment-modal-overlay-spm">
          <div className="payment-modal-spm">
            <div className="payment-modal-header-spm">
              <h2>{isEditing ? "Edit Payment" : "Add New Payment"}</h2>
              <button className="close-modal-btn-spm" onClick={() => toggleModal()}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <hr className="custom-hr-spm" />
            <form onSubmit={handleSubmit} className="payment-form-spm">
              {isEditing && (
                <div className="form-row-spm">
                  <div className="form-group-spm">
                    <label>Receipt Number</label>
                    <input type="text" name="receiptNumber" defaultValue={currentPayment?.receiptNumber || ""} readOnly />
                  </div>
                  <div className="form-group-spm">
                    <label>Created At</label>
                    <input type="text" defaultValue={currentPayment ? formatDateTime(currentPayment.createdAt) : ""} readOnly />
                  </div>
                </div>
              )}

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>First Name</label>
                  <input type="text" name="firstName" required defaultValue={currentPayment?.firstName || ""} />
                </div>
                <div className="form-group-spm">
                  <label>Last Name</label>
                  <input type="text" name="lastName" required defaultValue={currentPayment?.lastName || ""} />
                </div>
              </div>

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>Sacrament Type</label>
                  <select name="sacramentType" required defaultValue={currentPayment?.sacramentType || ""}>
                    <option value="">Select Sacrament</option>
                    <option value="Baptism">Baptism</option>
                    <option value="First Communion">First Communion</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Funeral">Funeral</option>
                    <option value="Mass Intention">Mass Intention</option>
                  </select>
                </div>

                {/* ✅ Category Select */}
                <div className="form-group-spm">
                  <label>Category</label>
                  <select name="category" required defaultValue={currentPayment?.category || ""}>
                    <option value="">Select Category</option>
                    <option value="Ministerial Services">Ministerial Services</option>
                    <option value="Collections">Collections</option>
                    <option value="Other Income">Other Income</option>
                    <option value="Donation from Special Projects">Donation from Special Projects</option>
                    <option value="Other Church Income/Donations Individuals">Other Church Income/Donations Individuals</option>
                    <option value="Foreign & Local Fundings Assistance">Foreign & Local Fundings Assistance</option>
                    <option value="Pontifical Collections">Pontifical Collections</option>
                    <option value="National Collections">National Collections</option>
                    <option value="Diocesan Collections">Diocesan Collections</option>
                    <option value="Priest Honoraria">Priest Honoraria</option>
                    <option value="Rectory Expenses">Rectory Expenses</option>
                    <option value="Regular Expenses">Regular Expenses</option>
                    <option value="Church Supplies & Other Expenses">Church Supplies & Other Expenses</option>
                    <option value="Repair & Maintenance">Repair & Maintenance</option>
                    <option value="Honorarium">Honorarium</option>
                    <option value="Pastoral Program">Pastoral Program</option>
                    <option value="Special Project Donation">Special Project Donation</option>
                    <option value="Remittance to the Curia">Remittance to the Curia</option>
                    <option value="Cash Advances (Receivables)">Cash Advances (Receivables)</option>
                  </select>
                </div>
              </div>

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>Total Amount (₱)</label>
                  <input type="number" name="totalAmount" required step="0.01" min="0" defaultValue={currentPayment?.totalAmount || ""} onChange={handleInputChange} />
                </div>
                <div className="form-group-spm">
                  <label>Amount Paid (₱)</label>
                  <input type="number" name="amountPaid" required step="0.01" min="0" defaultValue={currentPayment?.amountPaid || ""} onChange={handleInputChange} />
                </div>
                {isEditing && (
                  <div className="form-group-spm">
                    <label>Balance (₱)</label>
                    <input type="number" defaultValue={currentPayment?.balance || ""} readOnly />
                  </div>
                )}
              </div>

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>Change Amount (₱)</label>
                  <input type="number" name="changeAmount" step="0.01" min="0" readOnly value={calculateChange()} />
                </div>
              </div>

              <div className="form-actions-spm">
                <button type="submit" className="submit-btn-spm">{isEditing ? "Update" : "Save"}</button>
                <button type="button" className="cancel-btn-spm" onClick={() => toggleModal()}>Cancel</button>
                {isEditing && (
                  <button type="button" className="print-btn-spm">
                    <FontAwesomeIcon icon={faReceipt} /> Print Receipt
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryPayment;
