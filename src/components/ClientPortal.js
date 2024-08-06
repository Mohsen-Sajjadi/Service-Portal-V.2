import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import IssueFormClient from './IssueFormClient';
import { downloadCSV } from '../utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IssueModal from './IssueModal';

const ClientPortalComponent = () => {
  const { user, isAuthenticated } = useAuth0();
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [projectIssues, setProjectIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [currentFilter, setCurrentFilter] = useState('All Items');
  const [engineers, setEngineers] = useState([]); // Add state for engineers
  const issueFormRef = useRef(null);
  const [filters, setFilters] = useState({
    searchText: '',
    priority: '',
    status: '',
    issueDescription: '',
    siteBuilding: '',
    requestedBy: '',
    createdDateRange: [null, null],
    label: '',
    scheduleDateRange: [null, null],
    dateOfServiceRange: [null, null],
    engineer: '',
    activities: '',
    serviceType: '',
    hours: '',
  });

  useEffect(() => {
    const fetchProjectData = () => {
      if (isAuthenticated && user.email) {
        fetch(`http://localhost:3002/projects?email=${encodeURIComponent(user.email)}`)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              setProject(data[0]);
            } else {
              console.log("User doesn't have access to any project.");
            }
          })
          .catch(error => console.error('Error fetching project data:', error));
      }
    };

    const fetchAllProjects = () => {
      fetch('http://localhost:3002/projects')
        .then(response => response.json())
        .then(data => setProjects(data))
        .catch(error => console.error('Error fetching all projects:', error));
    };

    const fetchEngineers = () => {
      fetch('http://localhost:3002/engineers')
        .then(response => response.json())
        .then(data => setEngineers(data))
        .catch(error => console.error('Error fetching engineers data:', error));
    };

    fetchProjectData();
    fetchAllProjects();
    fetchEngineers(); // Fetch engineers data
  }, [isAuthenticated, user]);

  const getProjectNameById = (projectId) => {
    const project = projects.find(proj => proj.id.toString() === projectId.toString());
    return project ? project.project : 'Unknown Project';
  };

  const formatDate = (date) => {
    const d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  const prepareIssuesForDownload = (issues) => {
    return issues.map(issue => ({
      ...issue,
      projectName: getProjectNameById(issue.project),
      project: undefined
    }));
  };

  const handleDownloadIssuesCSV = () => {
    if (!project) {
      console.error('No project selected.');
      return;
    }

    const projectName = project.project;
    const dateStr = formatDate(new Date());
    const filename = `${projectName.replace(/ /g, '_')}_${dateStr}.csv`;
    console.log(`Downloading CSV as: ${filename}`);

    const preparedIssues = prepareIssuesForDownload(filteredIssues);
    downloadCSV(preparedIssues, filename);
  };

  console.log(project);
  console.log(projects);

  const filteredIssues = projectIssues?.filter(issue => {
    const createdDate = new Date(issue.createdDate);
    const scheduleDate = new Date(issue.scheduleDate);
    const dateOfService = new Date(issue.dateOfService);
    return (
      (currentFilter === 'All Items' ||
       (currentFilter === 'Service Items' && issue.label === 'Service') ||
       (currentFilter === 'T&M Items' && issue.label === 'T&M') ||
       (currentFilter === 'Recommended Actions' && issue.label === 'Recommended Action')) &&
      (!filters.searchText || issue.issueDescription.toLowerCase().includes(filters.searchText.toLowerCase())) &&
      (!filters.priority || issue.priority === filters.priority) &&
      (!filters.status || issue.status === filters.status) &&
      (!filters.label || issue.label === filters.label) &&
      (!filters.siteBuilding || issue.siteBuilding.toLowerCase().includes(filters.siteBuilding.toLowerCase())) &&
      (!filters.requestedBy || issue.requestedBy.toLowerCase().includes(filters.requestedBy.toLowerCase())) &&
      (!filters.createdDateRange[0] || (createdDate && createdDate >= filters.createdDateRange[0])) &&
      (!filters.createdDateRange[1] || (createdDate && createdDate <= filters.createdDateRange[1])) &&
      (!filters.scheduleDateRange[0] || (scheduleDate && scheduleDate >= filters.scheduleDateRange[0])) &&
      (!filters.scheduleDateRange[1] || (scheduleDate && scheduleDate <= filters.scheduleDateRange[1])) &&
      (!filters.dateOfServiceRange[0] || (dateOfService && dateOfService >= filters.dateOfServiceRange[0])) &&
      (!filters.dateOfServiceRange[1] || (dateOfService && dateOfService <= filters.dateOfServiceRange[1])) &&
      (!filters.engineer || issue.engineer.toLowerCase().includes(filters.engineer.toLowerCase())) &&
      (!filters.activities || issue.activities.toLowerCase().includes(filters.activities.toLowerCase())) &&
      (!filters.serviceType || issue.serviceType.toLowerCase().includes(filters.serviceType.toLowerCase())) &&
      (!filters.hours || issue.hours.toString().toLowerCase().includes(filters.hours.toLowerCase()))
    );
  }) || [];

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-in-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  const handleRowClick = (issue) => {
    console.log('Row clicked', issue);
    setModalContent({
      ...issue,
      attachedFileUrl: issue.attachedFile ? `http://localhost:3002/${issue.attachedFile}` : null,
    });
    setShowModal(true);
  };

  const handleFilterChange = (filter) => {
    if (filter === 'All Items') {
      setFilters({
        searchText: '',
        priority: '',
        status: '',
        issueDescription: '',
        siteBuilding: '',
        requestedBy: '',
        createdDateRange: [null, null],
        label: '',
        scheduleDateRange: [null, null],
        dateOfServiceRange: [null, null],
        engineer: '',
        activities: '',
        serviceType: '',
        hours: '',
      });
    }
    setCurrentFilter(filter);
  };

  const formatDateToLocal = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toLocaleString();
  };

  const onRemoveIssue = (issueId) => {
    fetch(`http://localhost:3002/issues/${issueId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        setProjectIssues(currentIssues => currentIssues.filter(issue => issue.id !== issueId));
        toggleIssueFormVisibility();
      } else {
        console.error('Failed to delete the issue.');
      }
    })
    .catch(error => console.error('Error removing issue:', error));
  };

  const handleEditIssue = (issue) => {
    setSelectedIssue(issue);
    setShowIssueForm(true);
  };

  const toggleIssueFormVisibility = () => {
    setShowIssueForm(!showIssueForm);
  };

  useEffect(() => {
    if (project) {
      fetch(`http://localhost:3002/issues?project=${project.id}`)
        .then(response => response.json())
        .then(data => setProjectIssues(data))
        .catch(error => console.error('Error fetching project issues:', error));
    }
  }, [project]);

  const handleIssueSubmitSuccess = () => {
    fetch(`http://localhost:3002/issues?project=${project.id}`)
      .then(response => response.json())
      .then(data => setProjectIssues(data))
      .catch(error => console.error('Error refetching project issues:', error));
    toggleIssueFormVisibility();
  };

  useEffect(() => {
    if (showIssueForm) {
      issueFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showIssueForm]);

  return (
    <div>
      {!project ? (
        <p>Loading...</p>
      ) : (
        <div className="project-card">
          <h1 className="project-title"> {project.project}</h1>
          <p className="project-detail"><span className="detail-label">Client Name:</span> {project.client}</p>
          <p className="project-detail"><span className="detail-label">Email:</span> {project.email}</p>
          <p className="project-detail"><span className="detail-label">Start Date:</span> {project.startDate}</p>
          <p className="project-detail"><span className="detail-label">End Date:</span> {project.endDate}</p>

          <button className="new-request-button" onClick={() => {
            setSelectedIssue(null);
            setShowIssueForm(true);
          }}>New Request</button>
          
          {showIssueForm && (
            <IssueFormClient
              ref={issueFormRef}
              projectId={project.id}
              hideForm={() => setShowIssueForm(false)}
              issue={selectedIssue}
              onIssueSubmitSuccess={handleIssueSubmitSuccess}
              onRemoveIssue={onRemoveIssue}
              engineers={engineers} // Pass engineers to IssueFormClient
              getProjectNameById={getProjectNameById} // Pass the function as a prop
            />
          )}

          <h3>Service Requests</h3>
          <button className="download-csv-button" onClick={handleDownloadIssuesCSV}>Download Table</button>

          <div className="filter-tabs">
            <button className="filter-button filter-element" onClick={() => handleFilterChange('All Items')}>All Items</button>
            <button className="filter-button filter-element" onClick={() => handleFilterChange('Service Items')}>Service Items</button>
            <button className="filter-button filter-element" onClick={() => handleFilterChange('T&M Items')}>T&M Items</button>
            <button className="filter-button filter-element" onClick={() => handleFilterChange('Recommended Actions')}>Recommended Actions</button>
            <div className="filter-element">
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="filter-element date-picker">
              <label>Created Date:</label>
              <DatePicker
                selected={filters.createdDateRange[0]}
                onChange={date => setFilters({ ...filters, createdDateRange: date })}
                startDate={filters.createdDateRange[0]}
                endDate={filters.createdDateRange[1]}
                selectsRange
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="filter-element date-picker">
              <label>Date of Service:</label>
              <DatePicker
                selected={filters.dateOfServiceRange[0]}
                onChange={date => setFilters({ ...filters, dateOfServiceRange: date })}
                startDate={filters.dateOfServiceRange[0]}
                endDate={filters.dateOfServiceRange[1]}
                selectsRange
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>

          <table className="issue-table">
            <thead>
              <tr>
                <th>Item#</th>
                <th>Issue Description</th>
                <th>Site / Building</th>
                <th>Requested By</th>
                <th>Created Date</th>
                <th>Label</th>
                <th>Attached File</th>
                <th>Priority</th>
                <th>Schedule Date</th>
                <th>Date of Service</th>
                <th>Engineer</th>
                <th>Activities</th>
                <th>Service Type</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue, index) => (
                <tr key={issue.id} onClick={() => handleRowClick(issue)}>
                  <td>{index + 1}</td>
                  <td className="truncate-text">{issue.issueDescription}</td>
                  <td>{issue.siteBuilding}</td>
                  <td>{issue.requestedBy}</td>
                  <td>{issue.createdDate}</td>
                  <td>{issue.label}</td>
                  <td>{issue.attachedFile ? <a href={`http://localhost:3002/${issue.attachedFile}`} target="_blank" rel="noopener noreferrer">Download</a> : ''}</td>
                  <td>{issue.priority}</td>
                  <td>{issue.scheduleDate}</td>
                  <td>{issue.dateOfService}</td>
                  <td>{issue.engineer}</td>
                  <td className="truncate-text">{issue.activities}</td>
                  <td>{issue.serviceType}</td>
                  <td>{issue.hours}</td>
                  <td className={getStatusClassName(issue.status)}>{issue.status}</td>
                  <td>{formatDateToLocal(issue.lastUpdated)}</td>
                  <td>
                    <button 
                      className="edit-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditIssue(issue, e);
                      }}>Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <IssueModal
          content={modalContent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ClientPortalComponent;
