import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportAccount.css'; // Ensure you include appropriate CSS styling.

const ReportAccount = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingAllReports, setLoadingAllReports] = useState(false);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

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

  const handleStudentChange = (e) => {
    const studentName = e.target.value;
    setSelectedStudent(studentName);
    fetchReports(studentName);
  };

  const fetchAllReports = async () => {
    setLoadingAllReports(true);
    try {
      const response = await axios.get('http://localhost:5000/reports');
      setAllReports(response.data);
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
        <div className="form-row">
          <label htmlFor="student">Select Student:</label>
          <select
            id="student"
            value={selectedStudent}
            onChange={handleStudentChange}
            required
          >
            <option value="">-- Select a student --</option>
            {students.map((student) => (
              <option key={student._id} value={student.name}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="reportDetails">Details:</label>
          <textarea
            id="reportDetails"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="report-account__submit-btn">
          Submit Report
        </button>
      </form>

      {submittedReport && (
        <div className="report-submitted">
          <h3>Report Submitted!</h3>
          <p>Tracking ID: {submittedReport.trackingId}</p>
        </div>
      )}

      <button onClick={fetchAllReports} className="report-account__view-all-btn">
        View All Reports
      </button>

      {loadingAllReports ? (
        <p>Loading all reports...</p>
      ) : (
        allReports.length > 0 && (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Timestamp</th>
                <th>Reason</th>
                <th>Tracking ID</th>
              </tr>
            </thead>
            <tbody>
              {allReports.map((report) => (
                report.reports.map((r) => (
                  <tr key={r.trackingId}>
                    <td>{report.studentName}</td>
                    <td>{r.timestamp}</td>
                    <td>{r.reason}</td>
                    <td>{r.trackingId}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};

export default ReportAccount;
