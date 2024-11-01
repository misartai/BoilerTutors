import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportAccount = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]); // New state for all reports
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingAllReports, setLoadingAllReports] = useState(false); // New loading state for all reports
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch students when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/students');
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
      const response = await axios.post('http://localhost:5000/reports', {
        studentName: selectedStudent,
        reason: reportDetails,
      });

      setSubmittedReport(response.data);
      setReportDetails('');
      setError('');
      fetchReports(selectedStudent);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report');
    }
  };

  // Function to fetch reports for the selected student
  const fetchReports = async (studentName) => {
    setLoadingReports(true);
    try {
      const response = await axios.get(`http://localhost:5000/reports/${studentName}`);
      setReports(response.data.reports || []);
      setLoadingReports(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports');
      setLoadingReports(false);
    }
  };

  // Function to handle student selection change
  const handleStudentChange = (e) => {
    const studentName = e.target.value;
    setSelectedStudent(studentName);
    fetchReports(studentName); // Pass studentName
  };

  // Function to handle report click
  const handleReportClick = (trackingId) => {
    const report = reports.find(report => report.trackingId === trackingId);
    setSelectedReport(report); // Set selected report for display
  };

  // New function to fetch all reports
  const fetchAllReports = async () => {
    setLoadingAllReports(true);
    try {
      const response = await axios.get('http://localhost:5000/reports');
      setAllReports(response.data); // Set all reports state
      setLoadingAllReports(false);
    } catch (error) {
      console.error('Error fetching all reports:', error);
      setError('Failed to fetch all reports');
      setLoadingAllReports(false);
    }
  };

  return (
    <div className="report-account">
      <h2 className="report-account__header">Report Account</h2>
      
      <form onSubmit={handleSubmitReport} className="report-account__form">
        <label htmlFor="student">Select Student:</label>
        <select id="student" value={selectedStudent} onChange={handleStudentChange}>
          <option value="">-- Select a student --</option>
          {students.map((student) => (
            <option key={student._id} value={student.name}>{student.name}</option>
          ))}
        </select>
        
        <label className="reportDetails"> Details:</label>
        <textarea
          id="reportDetails"
          value={reportDetails}
          onChange={(e) => setReportDetails(e.target.value)}
          required
        />

        <button type="submit" className="report-account__submit-btn">Submit Report</button>
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
            <ul className="report-account__report-list">
              {reports.map((report) => (
                <li key={report.trackingId} className="report-card">
                  <button onClick={() => handleReportClick(report.trackingId)} className="report-card__tracking-id">
                    {report.trackingId}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reports found for this student.</p>
          )}

          {selectedReport && (
            <div className="report-card__details">
              <h4 className="report-card__title">Report Details</h4>
              <p><strong>Student Name:</strong> {selectedStudent}</p>
              <p><strong>Tracking ID:</strong> {selectedReport.trackingId}</p>
              <p><strong>Reason:</strong> {selectedReport.reason}</p>
            </div>
          )}
        </>
      )}

      <button onClick={fetchAllReports} className="report-account__view-all-btn">View All Reports</button>

      {loadingAllReports ? (
        <p>Loading all reports...</p>
      ) : (
        <div>
          <h3>All Reports</h3>
          {allReports.length > 0 ? (
            allReports.map(report => (
              <div key={report.studentName} className="report-card">
                <h4 className="report-card__title">Reports for {report.studentName}</h4>
                <ul>
                  {report.reports.map(r => (
                    <li key={r.trackingId}>
                      <strong>Tracking ID:</strong> {r.trackingId}<br />
                      <strong>Timestamp:</strong> {r.timestamp}<br />
                      <strong>Reason:</strong> {r.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No reports found.</p>
          )}
        </div>
      )}
    </div>
  );
};


export default ReportAccount;
