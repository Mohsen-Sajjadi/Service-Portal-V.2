import React from 'react';
import '../App.css'; // Assuming you have styles defined here for the modal

const IssueModal = ({ content, onClose }) => {
  if (!content) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <p className="modal-text"></p>
      <h3>Issue Details</h3>
        {/* Display the issue details */}
        <p>Description: {content.issueDescription}</p>
        <p>Site/Building: {content.siteBuilding}</p>
        <p>Requested By: {content.requestedBy}</p>
        <p>Created Date: {content.createdDate}</p>
        <p>Label: {content.label}</p>
        <p>Status: {content.status}</p>
        <p>Priority: {content.priority}</p>
        <p>schedule Date: {content.scheduleDate}</p>
        <p>Date of Service: {content.dateOfService}</p>
        <p>Engineer: {content.engineer}</p>
        <p>Activities: {content.activities}</p>
        <p>Service Type: {content.serviceType}</p>
        <p>Hours: {content.hours}</p>
        <p>Last Updated: {content.lastUpdated}</p>

        {/* Add more issue details as needed */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default IssueModal;