import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PayLedger = ({ tutorId }) => {
  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [date, status]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`/api/payLedger/${tutorId}`, {
        params: { date, status },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <div>
      <h2>Payment Ledger</h2>
      <label>Date:</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <label>Status:</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Denied">Denied</option>
      </select>

      <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
        {transactions.map((txn, index) => (
          <div key={index} className="transaction">
            <p>Student Name: {txn.studentName}</p>
            <p>Status: {txn.status}</p>
            <p>Timestamp: {new Date(txn.timestamp).toLocaleString()}</p>
            <p>Amount: ${txn.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayLedger;

