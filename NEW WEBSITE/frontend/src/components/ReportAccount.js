import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const ReportAccount = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch students when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students');
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students');
      }
    };

    fetchStudents();
  }, []);

  // Function to handle report submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/reports', {
        studentId: selectedStudent,
        details: reportDetails,
      });

      setSubmittedReport(response.data); // Store the submitted report tracking ID
      setReportDetails(''); // Clear report details
      setError(''); // Clear any previous errors
      fetchReports(selectedStudent); // Refresh reports for the selected student
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report');
    }
  };

  // Function to fetch reports for the selected student
  const fetchReports = async (studentId) => {
    setLoadingReports(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${studentId}`);
      setReports(response.data.reports || []); // Update to use the correct data structure
      setLoadingReports(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports');
      setLoadingReports(false);
    }
  };

  // Function to handle student selection change
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    fetchReports(studentId);
  };

  // Function to fetch details of a selected report
  const fetchReportDetails = async (trackingId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/details/${trackingId}`);
      setSelectedReport(response.data); // Set the selected report for details
    } catch (error) {
      console.error('Error fetching report details:', error);
      setError('Failed to fetch report details');
    }
  };

  return (
    <div className="report-account">
      <h2>Report Account</h2>
      <form onSubmit={handleSubmitReport}>
        <label htmlFor="student">Select Student:</label>
        <select id="student" value={selectedStudent} onChange={handleStudentChange}>
          <option value="">-- Select a student --</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>{student.name}</option>
          ))}
        </select>

        <label htmlFor="reportDetails">Report Details:</label>
        <textarea
          id="reportDetails"
          value={reportDetails}
          onChange={(e) => setReportDetails(e.target.value)}
          required
        />

        <button type="submit">Submit Report</button>
      </form>

      {submittedReport && (
        <div>
          <h3>Report Submitted!</h3>
          <p>Tracking ID: {submittedReport.trackingId}</p>
        </div>
      )}

      {loadingReports ? (
        <p>Loading reports...</p>
      ) : (
        <>
          <h3>Reports for Selected Student</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {reports.length > 0 ? (
            <ul>
              {reports.map((report) => (
                <li key={report.trackingId}>
                  <span>{report.trackingId} - {report.details}</span>
                  <button onClick={() => fetchReportDetails(report.trackingId)}>View Details</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reports found for this student.</p>
          )}
        </>
      )}

      {selectedReport && (
        <div>
          <h3>Report Details</h3>
          <p><strong>Tracking ID:</strong> {selectedReport.trackingId}</p>
          <p><strong>Details:</strong> {selectedReport.details}</p>
        </div>
      )}
    </div>
  );
};

export default ReportAccount;
