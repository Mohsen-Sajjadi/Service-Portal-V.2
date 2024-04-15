import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from './Loading'; // Assuming Loading.js is in the same directory

function IssueDetails() {
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/issues/${issueId}`)
      .then(response => response.json())
      .then(data => setIssue(data))
      .catch(error => console.error('Error fetching issue details:', error));
  }, [issueId]);

  if (!issue) return <Loading />; // Use your Loading component

  return (
    <div>
      {/* Render your issue details here using the issue state */}
      <h2>{issue.issueDescription}</h2>
      {/* ... other issue details */}
    </div>
  );
}

export default IssueDetails;