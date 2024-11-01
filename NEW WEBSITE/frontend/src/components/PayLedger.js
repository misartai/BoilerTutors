import React, { useEffect, useState } from 'react';
import './PayLedger.css'; // Import the CSS file

const PayLedger = () => {
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState(null); // State for error handling
    const [statusFilter, setStatusFilter] = useState('All'); // State for the status filter
    const [dateFilter, setDateFilter] = useState('Most Recent'); // State for the date filter

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch('/api/payments');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("Payments Data:", data); // Log the payments data
                setPayments(data);
            } catch (error) {
                console.error('Error fetching payments:', error);
                setError(error.message); // Set error state
            }
        };

        fetchPayments();
    }, []);

    // Function to handle status filter change
    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    // Function to handle date filter change
    const handleDateFilterChange = (event) => {
        setDateFilter(event.target.value);
    };

    // Function to filter and sort payments based on status and date
    const filteredPayments = () => {
        let allPayments = [];
        payments.forEach(payment => {
            payment.payments.forEach(singlePayment => {
                allPayments.push({
                    studentName: payment.studentName,
                    amount: singlePayment.amount,
                    status: singlePayment.status,
                    timestamp: singlePayment.timestamp,
                    reason: singlePayment.reason || 'N/A'
                });
            });
        });

        // Filter based on the selected status
        if (statusFilter === 'Paid') {
            allPayments = allPayments.filter(payment => payment.status === 'Paid');
        } else if (statusFilter === 'Denied') {
            allPayments = allPayments.filter(payment => payment.status === 'Denied');
        }

        // Sort by status: 'Paid' on top, 'Denied' below
        allPayments.sort((a, b) => {
            if (a.status === 'Paid' && b.status === 'Denied') return -1;
            if (a.status === 'Denied' && b.status === 'Paid') return 1;
            return 0; // Keep original order if both are the same
        });

        // Sort by timestamp: Most Recent or Least Recent
        if (dateFilter === 'Most Recent') {
            allPayments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Most recent first
        } else if (dateFilter === 'Least Recent') {
            allPayments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Least recent first
        }

        return allPayments;
    };

    return (
        <div className="pay-ledger-container">
            <h1>Pay Ledger</h1>
            {error && <p className="error-message">Error: {error}</p>} {/* Display error if any */}

            <div className="filter-container">
                {/* Filter Dropdown for Status */}
                <label htmlFor="statusFilter">Filter by status: </label>
                <select id="statusFilter" value={statusFilter} onChange={handleStatusFilterChange}>
                    <option value="All">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Denied">Denied</option>
                </select>

                {/* Filter Dropdown for Date/Time */}
                <label htmlFor="dateFilter">Sort by date/time: </label>
                <select id="dateFilter" value={dateFilter} onChange={handleDateFilterChange}>
                    <option value="Most Recent">Most Recent</option>
                    <option value="Least Recent">Least Recent</option>
                </select>
            </div>

            <table className="pay-ledger-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPayments().length > 0 ? ( // Check if there are payments
                        filteredPayments().map((payment, index) => (
                            <tr key={index}>
                                <td>{payment.studentName}</td>
                                <td>{payment.amount}</td>
                                <td>{payment.status}</td>
                                <td>{payment.timestamp}</td> {/* Directly use the timestamp */}
                                <td>{payment.reason}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No payment records available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PayLedger;
