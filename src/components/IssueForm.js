import React, { useState, useEffect, forwardRef } from 'react';

const IssueForm = forwardRef(({
  projectId,
  engineers,
  hideForm,
  issue,
  onRemoveIssue,
  onIssueSubmitSuccess,
  getProjectNameById // Accept getProjectNameById as a prop
}, ref) => {
  const [newIssue, setNewIssue] = useState({
    project: parseInt(projectId, 10),
    issueDescription: issue?.issueDescription || '',
    siteBuilding: issue?.siteBuilding || '',
    requestedBy: issue?.requestedBy || '',
    createdDate: issue?.createdDate || '',
    label: issue?.label || '',
    attachedFile: issue?.attachedFile || null,
    priority: issue?.priority || '',
    status: issue?.status || '',
    scheduleDate: issue?.scheduleDate || '',
    dateOfService: issue?.dateOfService || '',
    engineer: issue?.engineer || '',
    activities: issue?.activities || '',
    serviceType: issue?.serviceType || '',
    hours: issue?.hours || '',
    lastUpdated: issue?.lastUpdated || new Date().toISOString(),
  });

  useEffect(() => {
    if (issue) {
      setNewIssue(prev => ({
        ...prev,
        project: parseInt(projectId, 10),
        issueDescription: issue.issueDescription,
        siteBuilding: issue.siteBuilding,
        requestedBy: issue.requestedBy,
        createdDate: issue.createdDate,
        label: issue.label,
        attachedFile: issue.attachedFile,
        priority: issue.priority,
        status: issue.status,
        scheduleDate: issue.scheduleDate,
        dateOfService: issue.dateOfService,
        engineer: issue.engineer || '',
        activities: issue.activities,
        serviceType: issue.serviceType,
        hours: issue.hours,
      }));
    }
  }, [issue, projectId]);

  const handleInputChange = (event) => {
    setNewIssue({
      ...newIssue,
      [event.target.name]: event.target.value
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setNewIssue({
      ...newIssue,
      attachedFile: file
    });
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('attachedFile', newIssue.attachedFile);
    formData.append('projectId', projectId);
    formData.append('issueId', issue ? issue.id : 'new');
  
    try {
      const response = await fetch('http://localhost:3002/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
  
      const data = await response.json();
      return data.filePath;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let filePath;
    if (newIssue.attachedFile) {
      filePath = await uploadFile();
    }

    const issueWithLastUpdated = {
      ...newIssue,
      attachedFile: filePath,
      projectId: parseInt(newIssue.project, 10),
      lastUpdated: new Date().toISOString(),
    };

    fetch(`http://localhost:3002/issues${issue ? `/${issue.id}` : ''}`, {
      method: issue ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueWithLastUpdated),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(issue ? 'Failed to update issue' : 'Failed to create issue');
      }
      return response.json();
    })
    .then(data => {
      console.log('Issue saved successfully:', data);
      hideForm();
      setNewIssue({});
      onIssueSubmitSuccess();
      if (data.engineer) {
        sendEmailNotification(data);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  function sendEmailNotification(issue) {
    const engineer = engineers.find(engineer => engineer.name === issue.engineer);
    if (engineer && engineer.email) {
      fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: engineer.email,
          subject: `Assigned Issue: ${issue.issueDescription}`,
          text: `You have been assigned an issue: ${issue.issueDescription} in project ${getProjectNameById(issue.project)}. Please check your dashboard for more details.`,
          project: getProjectNameById(issue.project),
          issueDetails: JSON.stringify(issue, null, 2)
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Email sent:', data);
      })
      .catch(error => {
        console.error('Failed to send email:', error);
      });
    } else {
      console.error('Engineer email not found.');
    }
  }

  const handleRemove = () => {
    if (issue && window.confirm('Are you sure you want to delete this issue?')) {
      onRemoveIssue(issue.id);
    }
  };

  return (
    <div ref={ref} className="form-container">
      <form onSubmit={handleSubmit} className="issue-form">
        <div className="form-group">
          <label className="form-label">Issue Description:</label>
          <textarea
            className="form-control"
            name="issueDescription"
            value={newIssue.issueDescription}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Site / Building:</label>
          <input
            className="form-control"
            type="text"
            name="siteBuilding"
            value={newIssue.siteBuilding}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Requested By:</label>
          <input
            className="form-control"
            type="text"
            name="requestedBy"
            value={newIssue.requestedBy}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Created Date:</label>
          <input
            className="form-control"
            type="date"
            name="createdDate"
            value={newIssue.createdDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Label:</label>
          <select
            className="form-control"
            name="label"
            value={newIssue.label}
            onChange={handleInputChange}
            required
          >
            <option value="">Select...</option>
            <option value="Service">Service</option>
            <option value="T&M">T&M</option>
            <option value="Recommended Action">Recommended Action</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Attached File:</label>
          <input
            className="form-control"
            type="file"
            name="attachedFile"
            onChange={handleFileChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Priority:</label>
          <select
            className="form-control"
            name="priority"
            value={newIssue.priority}
            onChange={handleInputChange}
          >
            <option value="">Select...</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Status:</label>
          <select
            className="form-control"
            name="status"
            value={newIssue.status}
            onChange={handleInputChange}
          >
            <option value="">Select...</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Schedule Date:</label>
          <input
            className="form-control"
            type="date"
            name="scheduleDate"
            value={newIssue.scheduleDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date of Service:</label>
          <input
            className="form-control"
            type="date"
            name="dateOfService"
            value={newIssue.dateOfService}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Engineer:</label>
          <select
            name="engineer"
            value={newIssue.engineer}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Engineer...</option>
            {engineers.map(engineer => (
              <option key={engineer.id} value={engineer.name}>{engineer.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Activities:</label>
          <textarea
            className="form-control"
            name="activities"
            value={newIssue.activities}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Service Type:</label>
          <select
            className="form-control"
            name="serviceType"
            value={newIssue.serviceType}
            onChange={handleInputChange}
          >
            <option value="">Select...</option>
            <option value="Preventative Maintenance (Site)">Preventative Maintenance (Site)</option>
            <option value="Preventative Maintenance (Remote)">Preventative Maintenance (Remote)</option>
            <option value="Emergency Maintenance (Site)">Emergency Maintenance (Site)</option>
            <option value="Emergency Maintenance (Remote)">Emergency Maintenance (Remote)</option>
            <option value="Service Agreement Performance Meeting Activities">Service Agreement Performance Meeting Activities</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Hours:</label>
          <input
            className="form-control"
            type="number"
            name="hours"
            value={newIssue.hours}
            onChange={handleInputChange}
          />
        </div>
        <button className="submit-button" type="submit">{issue ? 'Update' : 'Submit'}</button>
        <button type="button" className="remove-button" onClick={handleRemove}> Remove
        </button>
      </form>
    </div>
  );
});

export default IssueForm;
