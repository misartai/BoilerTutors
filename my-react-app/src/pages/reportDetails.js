import React from 'react';
import { useParams } from 'react-router-dom';

const ReportDetails = () => {
  const { trackingId } = useParams();  // Extract the tracking ID from the URL

  return (
    <div>
      <h1>Report Details for Tracking ID: {trackingId}</h1>
      {/* In a real app, you'd fetch the report details from a server */}
      <p>Details about the issue reported will go here...</p>
    </div>
  );
};

export default ReportDetails;