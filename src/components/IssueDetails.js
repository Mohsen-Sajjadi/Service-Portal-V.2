import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from './Loading'; // Assuming Loading.js is in the same directory
import '../App.css'; // Assuming IssueDetails.css is in the same directory

function IssueDetails() {
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3002/issues/${issueId}`)
      .then(response => response.json())
      .then(data => setIssue(data))
      .catch(error => console.error('Error fetching issue details:', error));
  }, [issueId]);

  if (!issue) return <Loading />; // Use your Loading component

  return (
    <div className="issue-details-card">
      <h2>{issue.issueDescription}</h2>
      <div className="issue-detail"><strong>Project:</strong> {issue.project}</div>
      <div className="issue-detail"><strong>Site/Building:</strong> {issue.siteBuilding}</div>
      <div className="issue-detail"><strong>Requested By:</strong> {issue.requestedBy}</div>
      <div className="issue-detail"><strong>Created Date:</strong> {issue.createdDate}</div>
      <div className="issue-detail"><strong>Label:</strong> {issue.label}</div>
      <div className="issue-detail"><strong>Priority:</strong> {issue.priority}</div>
      <div className="issue-detail"><strong>Status:</strong> {issue.status}</div>
      <div className="issue-detail"><strong>Schedule Date:</strong> {issue.scheduleDate}</div>
      <div className="issue-detail"><strong>Date of Service:</strong> {issue.dateOfService}</div>
      <div className="issue-detail"><strong>Engineer:</strong> {issue.engineer}</div>
      <div className="issue-detail"><strong>Activities:</strong> {issue.activities}</div>
      <div className="issue-detail"><strong>Service Type:</strong> {issue.serviceType}</div>
      <div className="issue-detail"><strong>Hours:</strong> {issue.hours}</div>
      {issue.attachedFile && <div className="issue-detail"><strong>Attached File:</strong> <a href={`http://localhost:3002/${issue.attachedFile}`} target="_blank" rel="noopener noreferrer">Download</a></div>}
    </div>
  );
}

export default IssueDetails;
