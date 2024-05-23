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
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('All Items');
  const issueFormRef = useRef(null);
  const [filters, setFilters] = useState({
    searchText: '',
    priority: '',
    status: '',
    issueDescription: '',
    siteBuilding: '',
    requestedBy: '',
    createdDate: '',
    label: '',
    scheduleDate: '',
    dateOfService: '',
    engineer: '',
    activities: '',
    serviceType: '',
    hours: '',
  });

  useEffect(() => {
    const fetchProjectData = () => {
      if (isAuthenticated && user.email) {
        fetch(`http://localhost:3001/projects?email=${encodeURIComponent(user.email)}`)
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
      fetch('http://localhost:3001/projects')
        .then(response => response.json())
        .then(data => setProjects(data))
        .catch(error => console.error('Error fetching all projects:', error));
    };

    fetchProjectData();
    fetchAllProjects();
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

  const filteredIssues = projectIssues.filter(issue => {
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
      (!filters.createdDateStart || (createdDate && createdDate >= new Date(filters.createdDateStart))) &&
      (!filters.createdDateEnd || (createdDate && createdDate <= new Date(filters.createdDateEnd))) &&
      (!filters.scheduleDateStart || (scheduleDate && scheduleDate >= new Date(filters.scheduleDateStart))) &&
      (!filters.scheduleDateEnd || (scheduleDate && scheduleDate <= new Date(filters.scheduleDateEnd))) &&
      (!filters.dateOfServiceStart || (dateOfService && dateOfService >= new Date(filters.dateOfServiceStart))) &&
      (!filters.dateOfServiceEnd || (dateOfService && dateOfService <= new Date(filters.dateOfServiceEnd))) &&
      (!filters.engineer || issue.engineer.toLowerCase().includes(filters.engineer.toLowerCase())) &&
      (!filters.activities || issue.activities.toLowerCase().includes(filters.activities.toLowerCase())) &&
      (!filters.serviceType || issue.serviceType.toLowerCase().includes(filters.serviceType.toLowerCase())) &&
      (!filters.hours || issue.hours.toString().toLowerCase().includes(filters.hours.toLowerCase()))
    );
  });

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
    setModalContent(issue);
    setShowModal(true);
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const formatDateToLocal = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toLocaleString();
  };

  const onRemoveIssue = (issueId) => {
    fetch(`http://localhost:3001/issues/${issueId}`, {
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
      fetch(`http://localhost:3001/issues?project=${project.id}`)
        .then(response => response.json())
        .then(data => setProjectIssues(data))
        .catch(error => console.error('Error fetching project issues:', error));
    }
  }, [project]);

  const handleIssueSubmitSuccess = () => {
    fetch(`http://localhost:3001/issues?project=${project.id}`)
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
          <h1 className="project-title">Project Name: {project.project}</h1>
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
            />
          )}

          <h3>Service Requests</h3>
          <button className="download-csv-button" onClick={handleDownloadIssuesCSV}>Download Table</button>

          <div className="filter-bar">
            <button className={showFilters ? "hide-filters-button" : "show-filters-button"}
              onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {showFilters && (
              <>
                <button onClick={() => setFilters({
                  searchText: '',
                  priority: '',
                  status: '',
                  issueDescription: '',
                  siteBuilding: '',
                  requestedBy: '',
                  createdDateStart: '',
                  createdDateEnd: '',
                  label: '',
                  scheduleDateStart:'',
                  scheduleDateEnd: '',
                  dateOfServiceStart: '',
                  dateOfServiceEnd: '',
                  engineer: '',
                  activities: '',
                  serviceType: '',
                  hours: '',
                })}>
                  Reset Filters
                </button>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.searchText}
                  onChange={e => setFilters({ ...filters, searchText: e.target.value })}
                />
                <select
                  value={filters.priority}
                  onChange={e => setFilters({ ...filters, priority: e.target.value })}
                >
                  <option value="">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
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
                <input
                  type="text"
                  placeholder="Issue Description"
                  value={filters.issueDescription}
                  onChange={e => setFilters({ ...filters, issueDescription: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Site / Building"
                  value={filters.siteBuilding}
                  onChange={e => setFilters({ ...filters, siteBuilding: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Requested By"
                  value={filters.requestedBy}
                  onChange={e => setFilters({ ...filters, requestedBy: e.target.value })}
                />
                <select
                  value={filters.label}
                  onChange={e => setFilters({ ...filters, label: e.target.value })}
                >
                  <option value="">All Labels</option>
                  <option value="Service">Service</option>
                  <option value="T&M">T&M</option>
                </select>
                <input
                  type="text"
                  placeholder="Engineer"
                  value={filters.engineer}
                  onChange={e => setFilters({ ...filters, engineer: e.target.value })}
                />
                <select
                  value={filters.serviceType}
                  onChange={e => setFilters({ ...filters, serviceType: e.target.value })}
                >
                  <option value="">All Service Types</option>
                  <option value="Preventative Maintenance (Site)">Preventative Maintenance (Site)</option>
                  <option value="Preventative Maintenance (Remote)">Preventative Maintenance (Remote)</option>
                  <option value="Emergency Maintenance (Site)">Emergency Maintenance (Site)</option>
                  <option value="Emergency Maintenance (Remote)">Emergency Maintenance (Remote)</option>
                  <option value="Service Agreement Performance Meeting Activities">Service Agreement Performance Meeting Activities</option>
                </select>
                <input
                  type="text"
                  placeholder="Hours"
                  value={filters.hours}
                  onChange={e => setFilters({ ...filters, hours: e.target.value })}
                />
                <div className="date-filter">
                  <div>
                    <label>Created Date:</label>
                    <DatePicker
                      selected={filters.createdDateStart}
                      onChange={date => setFilters({ ...filters, createdDateStart: date })}
                      selectsStart
                      startDate={filters.createdDateStart}
                      endDate={filters.createdDateEnd}
                      dateFormat="yyyy-MM-dd"
                    />
                    <DatePicker
                      selected={filters.createdDateEnd}
                      onChange={date => setFilters({ ...filters, createdDateEnd: date })}
                      selectsEnd
                      startDate={filters.createdDateStart}
                      endDate={filters.createdDateEnd}
                      minDate={filters.createdDateStart}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  <div>
                    <label>Schedule Date:</label>
                    <DatePicker
                      selected={filters.scheduleDateStart}
                      onChange={date => setFilters({ ...filters, scheduleDateStart: date })}
                      selectsStart
                      startDate={filters.scheduleDateStart}
                      endDate={filters.scheduleDateEnd}
                      dateFormat="yyyy-MM-dd"
                    />
                    <DatePicker
                      selected={filters.scheduleDateEnd}
                      onChange={date => setFilters({ ...filters, scheduleDateEnd: date })}
                      selectsEnd
                      startDate={filters.scheduleDateStart}
                      endDate={filters.scheduleDateEnd}
                      minDate={filters.scheduleDateStart}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  <div>
                    <label>Date of Service:</label>
                    <DatePicker
                      selected={filters.dateOfServiceStart}
                      onChange={date => setFilters({ ...filters, dateOfServiceStart: date })}
                      selectsStart
                      startDate={filters.dateOfServiceStart}
                      endDate={filters.dateOfServiceEnd}
                      dateFormat="yyyy-MM-dd"
                    />
                    <DatePicker
                      selected={filters.dateOfServiceEnd}
                      onChange={date => setFilters({ ...filters, dateOfServiceEnd: date })}
                      selectsEnd
                      startDate={filters.dateOfServiceStart}
                      endDate={filters.dateOfServiceEnd}
                      minDate={filters.dateOfServiceStart}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="filter-tabs">
            <button className="filter-button" onClick={() => handleFilterChange('All Items')}>All Items</button>
            <button className="filter-button" onClick={() => handleFilterChange('Service Items')}>Service Items</button>
            <button className="filter-button" onClick={() => handleFilterChange('T&M Items')}>T&M Items</button>
            <button className="filter-button" onClick={() => handleFilterChange('Recommended Actions')}>Recommended Actions</button>
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
                  <td>{issue.attachedFile ? issue.attachedFile.name : ''}</td>
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
