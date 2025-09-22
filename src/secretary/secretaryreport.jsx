import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./secretaryreport.css";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const SecretaryReport = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [availableYears, setAvailableYears] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const [formValues, setFormValues] = useState({
    amount: 0,
    quantity: 1
  });

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, monthFilter, yearFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      if (categoryFilter) queryParams.append('category', categoryFilter);
      if (monthFilter) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthNumber = monthNames.indexOf(monthFilter) + 1;
        queryParams.append('month', monthNumber);
      }
      if (yearFilter) queryParams.append('year', yearFilter);

      const response = await axios.get(`https://parishofdivinemercy.com/backend/report.php?${queryParams.toString()}`);
      if (response.data.success) {
        setExpenses(response.data.reports);
        setTotalExpenses(response.data.totalExpenses);
        if (response.data.availableYears) {
          setAvailableYears(response.data.availableYears);
        }
      } else {
        setMessage({ text: "Failed to fetch expense reports", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching expense reports:", error);
      setMessage({ text: "An error occurred while fetching expense data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = (expense = null) => {
    if (expense) {
      setIsEditing(true);
      setCurrentExpense(expense);
      setFormValues({
        amount: expense.amount,
        quantity: expense.quantity
      });
    } else {
      setIsEditing(false);
      setCurrentExpense(null);
      setFormValues({ amount: 0, quantity: 1 });
    }
    setShowModal(!showModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: parseFloat(value) || 0
    });
  };

  const calculateTotalCost = () => {
    return (formValues.amount * formValues.quantity).toFixed(2);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleCategoryFilterChange = (e) => setCategoryFilter(e.target.value);
  const handleMonthFilterChange = (e) => setMonthFilter(e.target.value);
  const handleYearFilterChange = (e) => setYearFilter(e.target.value);

  const filteredExpenses = expenses.filter(expense => {
    return searchTerm === "" ||
      expense.expenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateTimeString) => {
    try {
      if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateTimeString;
      }
      const datePart = dateTimeString.split(' ')[0];
      const date = new Date(datePart);
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="report-container-sr">
      <div className="title-container-sr">
        <h1 className="title-sr">EXPENSE REPORTS</h1>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="report-actions-sr">
        <div className="search-bar-sr">
          <input
            type="text"
            placeholder="Search expenses by name or description"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sr" />
        </div>

        <div className="filter-add-container-sr">
          <select
            className="filter-select-sr"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="">All Categories</option>

            <optgroup label="I. Parish Receipts Subject to 10% Diocesan Share">
              <option value="Ministerial Services">A. Ministerial Services</option>
              <option value="Collections">B. Collections</option>
              <option value="Other Income">C. Other Income</option>
            </optgroup>

            <optgroup label="II. Diocesan Receipts Not Subject to 10% Diocesan Share">
              <option value="Donation from Special Projects">A. Donation from Special Projects</option>
              <option value="Other Church Income/Donations Individuals">B. Other Church Income/Donations Individuals</option>
              <option value="Foreign & Local Fundings Assistance">C. Foreign & Local Fundings Assistance</option>
            </optgroup>

            <optgroup label="III. Diocesan Receipts">
              <option value="Pontifical Collections">A. Pontifical Collections</option>
              <option value="National Collections">B. National Collections</option>
              <option value="Diocesan Collections">C. Diocesan Collections</option>
            </optgroup>

            <optgroup label="Disbursement">
              <option value="Priest Honoraria">I. Priest Honoraria</option>
              <option value="Rectory Expenses">II. Rectory Expenses</option>
              <option value="Regular Expenses">III. Regular Expenses</option>
              <option value="Church Supplies & Other Expenses">IV. Church Supplies & Other Expenses</option>
              <option value="Repair & Maintenance">V. Repair & Maintenance</option>
              <option value="Honorarium">VI. Honorarium</option>
              <option value="Pastoral Program">VII. Pastoral Program</option>
              <option value="Special Project Donation">VIII. Special Project Donation</option>
              <option value="Remittance to the Curia">IX. Remittance to the Curia</option>
              <option value="Cash Advances (Receivables)">X. Cash Advances (Receivables)</option>
            </optgroup>

            <optgroup label="IV. Other Receipts">
              <option value="Parish Receipts Subject">Parish Receipts Subject</option>
              <option value="Ministerial Services">A. Ministerial Services</option>
              <option value="Collections">B. Collections</option>
              <option value="Other Income">C. Other Income</option>
            </optgroup>
          </select>

          <button className="add-btn-sr" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading expense data...</div>
      ) : (
        <table className="report-table-sr">
          <thead>
            <tr>
              <th>Expense Name</th>
              <th>Category</th>
              <th>Amount (₱)</th>
              <th>Quantity</th>
              <th>Total Cost</th>
              <th>Date of Expense</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <tr key={expense.reportID}>
                  <td>{expense.expenseName}</td>
                  <td>{expense.category}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>{expense.quantity}</td>
                  <td>{formatCurrency(expense.totalCost)}</td>
                  <td>{formatDate(expense.dateOfExpense)}</td>
                  <td>
                    <button className="sr-details" onClick={() => toggleModal(expense)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results-sr">No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="finance-summary-sr">
        <div className="summary-card-sr expense-card-sr">
          <h3>Total Expenses</h3>
          <p>{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {showModal && (
        <div className="report-modal-overlay-sr">
          <div className="report-modal-sr">
            <div className="report-modal-header-sr">
              <h2>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button className="close-modal-btn-sr" onClick={() => toggleModal()}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div><hr className="custom-hr-sr" /></div>

            <form onSubmit={handleSubmit} className="report-form-sr">
              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Expense Name</label>
                  <input
                    type="text"
                    name="expenseName"
                    required
                    defaultValue={currentExpense?.expenseName || ''}
                  />
                </div>
                <div className="form-group-sr">
                  <label>Category</label>
                  <select
                    name="category"
                    required
                    defaultValue={currentExpense?.category || ''}
                  >
                    <option value="">Select Category</option>

                    <optgroup label="I. Parish Receipts Subject to 10% Diocesan Share">
                      <option value="Ministerial Services">A. Ministerial Services</option>
                      <option value="Collections">B. Collections</option>
                      <option value="Other Income">C. Other Income</option>
                    </optgroup>

                    <optgroup label="II. Diocesan Receipts Not Subject to 10% Diocesan Share">
                      <option value="Donation from Special Projects">A. Donation from Special Projects</option>
                      <option value="Other Church Income/Donations Individuals">B. Other Church Income/Donations Individuals</option>
                      <option value="Foreign & Local Fundings Assistance">C. Foreign & Local Fundings Assistance</option>
                    </optgroup>

                    <optgroup label="III. Diocesan Receipts">
                      <option value="Pontifical Collections">A. Pontifical Collections</option>
                      <option value="National Collections">B. National Collections</option>
                      <option value="Diocesan Collections">C. Diocesan Collections</option>
                    </optgroup>

                    <optgroup label="Disbursement">
                      <option value="Priest Honoraria">I. Priest Honoraria</option>
                      <option value="Rectory Expenses">II. Rectory Expenses</option>
                      <option value="Regular Expenses">III. Regular Expenses</option>
                      <option value="Church Supplies & Other Expenses">IV. Church Supplies & Other Expenses</option>
                      <option value="Repair & Maintenance">V. Repair & Maintenance</option>
                      <option value="Honorarium">VI. Honorarium</option>
                      <option value="Pastoral Program">VII. Pastoral Program</option>
                      <option value="Special Project Donation">VIII. Special Project Donation</option>
                      <option value="Remittance to the Curia">IX. Remittance to the Curia</option>
                      <option value="Cash Advances (Receivables)">X. Cash Advances (Receivables)</option>
                    </optgroup>

                    <optgroup label="IV. Other Receipts">
                      <option value="Parish Receipts Subject">Parish Receipts Subject</option>
                      <option value="Ministerial Services">A. Ministerial Services</option>
                      <option value="Collections">B. Collections</option>
                      <option value="Other Income">C. Other Income</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Amount (₱)</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    step="0.01"
                    min="0"
                    defaultValue={currentExpense?.amount || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group-sr">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="1"
                    defaultValue={currentExpense?.quantity || 1}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group-sr">
                  <label>Total Cost (₱)</label>
                  <input
                    type="number"
                    name="totalCost"
                    readOnly
                    value={calculateTotalCost()}
                  />
                </div>
              </div>

              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Date of Expense</label>
                  {isEditing ? (
                    <input type="text" readOnly value={formatDate(currentExpense?.dateOfExpense || '')} />
                  ) : (
                    <input type="text" name="expenseDate" readOnly value={new Date().toISOString().slice(0, 10)} />
                  )}
                </div>
              </div>

              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Description</label>
                  <textarea name="description" rows="3" defaultValue={currentExpense?.description || ''}></textarea>
                </div>
              </div>

              <div className="form-actions-sr">
                <button type="submit" className="submit-btn-sr">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                <button type="button" className="cancel-btn-sr" onClick={() => toggleModal()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryReport;
