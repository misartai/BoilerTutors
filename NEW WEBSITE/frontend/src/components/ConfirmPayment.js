import React, { useState, useEffect } from 'react';
import './ConfirmPayment.css';

const ConfirmPayment = () => {
    const [paymentHistory, setPaymentHistory] = useState({});
    const [currentStatus, setCurrentStatus] = useState('Pending');
    const [notification, setNotification] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [reason, setReason] = useState('');
    const [studentName, setStudentName] = useState('');
    const [confirmedOnce, setConfirmedOnce] = useState(false);
    const [deniedOnce, setDeniedOnce] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:5000/students');
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, []);

    const sendEmail = async (subject, message) => {
        await fetch('http://localhost:5000/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message, studentName }),
        });
    };

    const confirmPayment = async () => {
        if (!studentName) return;
        if (confirmedOnce) {
            setNotification('You cannot confirm the payment again.');
            return;
        }

        const timestamp = new Date().toLocaleString();
        const newEntry = {
            status: 'Paid',
            timestamp: timestamp,
            reason: '', // No reason needed for confirmation
        };

        setPaymentHistory(prev => ({
            ...prev,
            [studentName]: [...(prev[studentName] || []), newEntry],
        }));

        await fetch(`http://localhost:5000/students/${studentName}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntry),
        });

        setCurrentStatus('Paid');
        setNotification('Payment confirmed by tutor.');
        setShowDetails(false);
        setReason('');
        setConfirmedOnce(true);
        setDeniedOnce(false);

        // Send email notification for payment confirmation
        await sendEmail('Payment Confirmed', `Payment for ${studentName} has been confirmed on ${timestamp}.`);
    };

    const denyPayment = () => {
        if (!studentName) return;
        if (deniedOnce) {
            setNotification('You cannot deny the payment again.');
            return;
        }

        setCurrentStatus('Denied');
        setNotification('Payment denied by tutor.');
        setShowDetails(true);
        setDeniedOnce(true);
        setConfirmedOnce(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const timestamp = new Date().toLocaleString();
        const newEntry = {
            status: 'Denied',
            timestamp: timestamp,
            reason: reason,
        };

        setPaymentHistory(prev => ({
            ...prev,
            [studentName]: [...(prev[studentName] || []), newEntry],
        }));

        await fetch(`http://localhost:5000/students/${studentName}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntry),
        });

        setNotification('Payment denied with reason provided.');
        setShowDetails(false);
        setReason('');

        // Send email notification for payment denial
        await sendEmail('Payment Denied', `Payment for ${studentName} has been denied for the following reason: ${reason}. Denied on ${timestamp}.`);
    };

    return (
        <div className="payment-container">
            <h1>Payment Ledger</h1>
            <label htmlFor="student-select">Select Student:</label>
            <select
                id="student-select"
                value={studentName}
                onChange={(e) => {
                    setStudentName(e.target.value);
                    setCurrentStatus('Pending');
                    setNotification('');
                    setShowDetails(false);
                    setReason('');
                    setConfirmedOnce(false);
                    setDeniedOnce(false);
                }}
            >
                <option value="">Select a student</option>
                {students.map((student, index) => (
                    <option key={index} value={student.name}>{student.name}</option>
                ))}
            </select>

            <div className="session">
                <h2>Session ID: 12345</h2>
                <p>Student: {studentName}</p>
                <p>Current Payment Status: <strong>{currentStatus}</strong></p>
  
                <div className="button-container">
                    <button className="confirm-btn" onClick={confirmPayment}>Confirm Payment</button>
                    <button className="deny-btn" onClick={denyPayment}>Deny Payment</button>
                </div>
  
                {notification && (
                    <div className="notification">
                        <p>{notification}</p>
                    </div>
                )}
  
                {showDetails && (
                    <form className="additional-details" onSubmit={handleSubmit}>
                        <h3>Provide further details:</h3>
                        <textarea
                            className="details-textbox"
                            placeholder="Explain why the payment was denied..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <button type="submit" className="submit-btn">Submit</button>
                    </form>
                )}
            </div>
  
            <div className="payment-history">
                <h3>Payment History for {studentName}:</h3>
                {(paymentHistory[studentName] || []).map((entry, index) => (
                    <div key={index} className="ledger-entry">
                        <p>Status: <strong>{entry.status}</strong></p>
                        <p>Timestamp: {entry.timestamp}</p>
                        {entry.reason && <p>Reason for Denial: {entry.reason}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConfirmPayment;
