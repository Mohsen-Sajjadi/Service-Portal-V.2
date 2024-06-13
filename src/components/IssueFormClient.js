import React, { useState, useEffect, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const IssueFormClient = forwardRef(({ projectId, hideForm, issue, onRemoveIssue, onIssueSubmitSuccess }, ref) => {
    const [newIssue, setNewIssue] = useState({
        project: projectId,
        issueDescription: issue?.issueDescription || '',
        siteBuilding: issue?.siteBuilding || '',
        requestedBy: issue?.requestedBy || '',
        createdDate: issue?.createdDate ? issue.createdDate.split('T')[0] : new Date().toISOString().split('T')[0],
        label: issue?.label || '',
        attachedFile: issue?.attachedFile || null,
        priority: issue?.priority || '',
        status: issue?.status || 'Open',
        scheduleDate: issue?.scheduleDate || '',
        dateOfService: issue?.dateOfService || '',
        engineer: issue?.engineer || '',
        activities: issue?.activities || '',
        serviceType: issue?.serviceType || '',
        hours: issue?.hours || '',
    });

    useEffect(() => {
        if (issue) {
            setNewIssue({
                project: projectId,
                issueDescription: issue.issueDescription,
                siteBuilding: issue.siteBuilding,
                requestedBy: issue.requestedBy,
                createdDate: issue.createdDate ? issue.createdDate.split('T')[0] : new Date().toISOString().split('T')[0],
                label: issue.label,
                attachedFile: issue.attachedFile,
                priority: issue.priority,
                status: issue.status,
                scheduleDate: issue.scheduleDate,
                dateOfService: issue.dateOfService,
                engineer: issue.engineer,
                activities: issue.activities,
                serviceType: issue.serviceType,
                hours: issue.hours,
            });
        }
    }, [issue, projectId]);

    const handleInputChange = (event) => {
        setNewIssue({
            ...newIssue,
            [event.target.name]: event.target.value,
        });
    };

    const handleDateChange = (date) => {
        setNewIssue({
            ...newIssue,
            createdDate: date.toISOString().split('T')[0],
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setNewIssue({
            ...newIssue,
            attachedFile: file,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Upload file if attached
        if (newIssue.attachedFile) {
            const filePath = await uploadFile();
            setNewIssue({
                ...newIssue,
                attachedFile: filePath,
            });
        }

        // Submit the issue here
        const issueWithLastUpdated = {
            ...newIssue,
            project: parseInt(projectId, 10),
            lastUpdated: new Date().toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false,
            }),
        };
        const method = issue ? 'PUT' : 'POST';
        const url = `http://localhost:3001/issues${issue ? `/${issue.id}` : ''}`;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(issueWithLastUpdated),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Issue saved successfully:', data);
            // Now send an email notification
            const emailData = {
                to: "mohsen@triton-concepts.com",
                subject: `New Issue Created: ${newIssue.issueDescription.substring(0, 20)}...`,
                text: `A new issue has been created with the following details:\n\nDescription: ${newIssue.issueDescription}\nPriority: ${newIssue.priority}\nStatus: ${newIssue.status}\n\nPlease check the portal for more details.`
            };

            return fetch('http://localhost:3001/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });
        })
        .then(response => {
            if (!response.ok) throw new Error('Email sending failed');
            console.log('Email sent successfully');
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            hideForm();
            setNewIssue({});
            onIssueSubmitSuccess();
        });
    };

    const uploadFile = async () => {
        const formData = new FormData();
        formData.append('attachedFile', newIssue.attachedFile);
        formData.append('projectId', projectId);
        formData.append('issueId', issue ? issue.id : 'new');
      
        try {
          const response = await fetch('http://localhost:3001/upload', {
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

    const handleRemove = () => {
        if (issue && window.confirm('Are you sure you want to delete this issue?')) {
            onRemoveIssue(issue.id);
        }
    };

    const handleCancel = () => {
        if (typeof hideForm === 'function') {
            hideForm();
        } else {
            console.error('hideForm is not a function');
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
                    <DatePicker
                        wrapperClassName="datePicker"
                        className="form-control"
                        selected={newIssue.createdDate ? new Date(newIssue.createdDate) : null}
                        onChange={handleDateChange}
                        minDate={new Date()} // Ensure maxDate is set to prevent future date selection
                        dateFormat={newIssue.createdDate === new Date().toISOString().split('T')[0] ? "'Today'" : "yyyy-MM-dd"}
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
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <button className="submit-button" type="submit">{issue ? 'Update' : 'Submit'}</button>
                <button type="button" className="remove-button" onClick={handleRemove}>Remove</button>
                <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
            </form>
        </div>
    );
});

export default IssueFormClient;
