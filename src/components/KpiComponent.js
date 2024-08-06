import React, { useEffect, useState } from 'react';
import IssueModal from './IssueModal'; // Ensure this path is correct
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { downloadCSV } from '../utils';
import '../App.css'; // Make sure to import your CSS for styling

const KpiComponent = () => {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [totalServiceHours, setTotalServiceHours] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('All Items');
  const [filters, setFilters] = useState({
    searchText: '',
    priority: '',
    status: '',
    issueDescription: '',
    siteBuilding: '',
    requestedBy: '',
    createdDateStart: null,
    createdDateEnd: null,
    label: '',
    scheduleDateStart: null,
    scheduleDateEnd: null,
    dateOfServiceStart: null,
    dateOfServiceEnd: null,
    engineer: '',
    activities: '',
    serviceType: '',
    hours: '',
    projectName: '', // Added project name filter
    createdDateRange: [null, null], // Initialize as array with nulls
    scheduleDateRange: [null, null], // Initialize as array with nulls
    dateOfServiceRange: [null, null], // Initialize as array with nulls
  });

  useEffect(() => {
    fetch('http://localhost:3002/projects')
      .then(res => res.json())
      .then(setProjects);
    fetch('http://localhost:3002/issues')
      .then(res => res.json())
      .then(setIssues);
    fetch('http://localhost:3002/engineers')
      .then(res => res.json())
      .then(setEngineers);
  }, []);

  const handleProjectSelect = (projectId) => {
    if (!projectId) {
      setSelectedProject(null);
      setIssues([]); // Clear issues when no project is selected
      setTotalServiceHours(0);
      return;
    }
    fetch(`http://localhost:3002/projects/${projectId}`)
      .then(response => response.json())
      .then(project => {
        setSelectedProject(project);
        fetchProjectIssues(projectId);
      })
      .catch(error => console.error('Error fetching project details:', error));
  };

  const fetchProjectIssues = (projectId) => {
    fetch(`http://localhost:3002/issues?project=${projectId}`)
      .then(response => response.json())
      .then(data => {
        setIssues(data);
        const totalHours = data.reduce((acc, issue) => acc + (parseFloat(issue.hours) || 0), 0);
        setTotalServiceHours(totalHours);
      })
      .catch(error => {
        console.error('Error fetching project issues:', error);
        setIssues([]); // Clear issues on error
        setTotalServiceHours(0); // Reset on error
      });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return [d.getFullYear(), (d.getMonth() + 1).toString().padStart(2, '0'), d.getDate().toString().padStart(2, '0')].join('-');
  };

  const prepareIssuesForDownload = (filteredIssues) => {
    return filteredIssues.map(issue => ({
      ...issue,
      projectName: projects.find(p => p.id === issue.project)?.project || 'Unknown',
      createdDate: formatDate(issue.createdDate),
      scheduleDate: formatDate(issue.scheduleDate),
      dateOfService: formatDate(issue.dateOfService),
      lastUpdated: formatDate(issue.lastUpdated),
      project: undefined,
    }));
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-in-progress';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Resolved':
        return 'status-resolved';
      default:
        return ''; // Default class if status is unrecognized
    }
  };

  const handleDownloadIssuesCSV = () => {
    const filteredIssues = getFilteredIssues();
    const preparedData = prepareIssuesForDownload(filteredIssues);
    const filename = `issues_${formatDate(new Date())}.csv`;
    downloadCSV(preparedData, filename);
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.project : 'Unknown';
  };

  const handleRowClick = (issue) => {
    setModalContent(issue);
    setShowModal(true);
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleProjectFilterChange = (projectId) => {
    setFilters({ ...filters, projectName: projectId });
  };

  const handleEngineerFilterChange = (engineerName) => {
    setFilters({ ...filters, engineer: engineerName });
  };

  useEffect(() => {
    if (selectedProject) {
      fetchProjectIssues(selectedProject.id);
    }
  }, [selectedProject]);

  const getFilteredIssues = () => {
    const createdDateStart = filters.createdDateStart ? filters.createdDateStart.toISOString() : null;
    const createdDateEnd = filters.createdDateEnd ? filters.createdDateEnd.toISOString() : null;
    const scheduleDateStart = filters.scheduleDateStart ? filters.scheduleDateStart.toISOString() : null;
    const scheduleDateEnd = filters.scheduleDateEnd ? filters.scheduleDateEnd.toISOString() : null;
    const dateOfServiceStart = filters.dateOfServiceStart ? filters.dateOfServiceStart.toISOString() : null;
    const dateOfServiceEnd = filters.dateOfServiceEnd ? filters.dateOfServiceEnd.toISOString() : null;

    return issues.filter(issue => {
      const createdDate = issue.createdDate ? new Date(issue.createdDate) : null;
      const scheduleDate = issue.scheduleDate ? new Date(issue.scheduleDate) : null;
      const dateOfService = issue.dateOfService ? new Date(issue.dateOfService) : null;

      return (
        (currentFilter === 'All Items' ||
          (currentFilter === 'Service Items' && issue.label === 'Service') ||
          (currentFilter === 'T&M Items' && issue.label === 'T&M') ||
          (currentFilter === 'Recommended Actions' && issue.label === 'Recommended Action')) &&
        (!filters.searchText || issue.issueDescription.toLowerCase().includes(filters.searchText.toLowerCase())) &&
        (!filters.priority || issue.priority === filters.priority) &&
        (!filters.status || issue.status === filters.status) &&
        (!filters.siteBuilding || issue.siteBuilding.toLowerCase().includes(filters.siteBuilding.toLowerCase())) &&
        (!filters.requestedBy || issue.requestedBy.toLowerCase().includes(filters.requestedBy.toLowerCase())) &&
        (!createdDateStart || (createdDate && createdDate >= new Date(createdDateStart))) &&
        (!createdDateEnd || (createdDate && createdDate <= new Date(createdDateEnd))) &&
        (!filters.label || issue.label === filters.label) &&
        (!scheduleDateStart || (scheduleDate && scheduleDate >= new Date(scheduleDateStart))) &&
        (!scheduleDateEnd || (scheduleDate && scheduleDate <= new Date(scheduleDateEnd))) &&
        (!dateOfServiceStart || (dateOfService && dateOfService >= new Date(dateOfServiceStart))) &&
        (!dateOfServiceEnd || (dateOfService && dateOfService <= new Date(dateOfServiceEnd))) &&
        (!filters.engineer || issue.engineer.toLowerCase().includes(filters.engineer.toLowerCase())) &&
        (!filters.activities || issue.activities.toLowerCase().includes(filters.activities.toLowerCase())) &&
        (!filters.serviceType || issue.serviceType.toLowerCase().includes(filters.serviceType.toLowerCase())) &&
        (!filters.hours || issue.hours.toString().toLowerCase().includes(filters.hours.toLowerCase())) &&
        (!filters.projectName || issue.project === parseInt(filters.projectName))
      );
    });
  };

  return (
    <div className="app-container">
      <h2>Project Reports</h2>
      <select
        value={selectedProject ? selectedProject.id : ''}
        onChange={(e) => handleProjectSelect(e.target.value)}
      >
        <option value="">Select a Project</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.project}</option>
        ))}
      </select>

      {selectedProject && selectedProject.id && (
        <div className="project-details">
          <h3 className="project-title">{selectedProject.project}</h3>
          <p className="project-info"><strong>Client:</strong> {selectedProject.client}</p>
          <p className="project-info"><strong>Address:</strong> {selectedProject.address}</p>
          <p className="project-info"><strong>Email:</strong> {selectedProject.email}</p>
          <p className="project-info"><strong>Start Date:</strong> {selectedProject.startDate}</p>
          <p className="project-info"><strong>End Date:</strong> {selectedProject.endDate}</p>
          <p className="project-info"><strong>Total Service Hours Included:</strong> {selectedProject.totalServiceHoursIncluded}</p>
          <p className="project-info"><strong>Total Service Hours:</strong> {totalServiceHours.toFixed(2)}</p>
          <p className="project-info"><strong>Username:</strong> {selectedProject.username}</p>
        </div>
      )}

      <h2>Service Reports</h2>
      <button className="download-csv-button" onClick={handleDownloadIssuesCSV}>Download Table</button>

      <div className="filter-element">
        <button className={showFilters ? "hide-filters-button" : "show-filters-button"} onClick={() => setShowFilters(!showFilters)}>
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
              createdDateStart: null,
              createdDateEnd: null,
              label: '',
              scheduleDateStart: null,
              scheduleDateEnd: null,
              dateOfServiceStart: null,
              dateOfServiceEnd: null,
              engineer: '',
              activities: '',
              serviceType: '',
              hours: '',
              projectName: '', // Reset projectName filter
              createdDateRange: [null, null], // Reset date ranges
              scheduleDateRange: [null, null], // Reset date ranges
              dateOfServiceRange: [null, null], // Reset date ranges
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
              value={filters.projectName}
              onChange={e => handleProjectFilterChange(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.project}</option>
              ))}
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
            <select
              value={filters.priority}
              onChange={e => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
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
              <option value="Recommended Action">Recommended Action</option>
            </select>
            <select
              value={filters.engineer}
              onChange={e => handleEngineerFilterChange(e.target.value)}
            >
              <option value="">All Engineers</option>
              {engineers.map(engineer => (
                <option key={engineer.id} value={engineer.name}>{engineer.name}</option>
              ))}
            </select>
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
            <div className="date-filter">
              <div>
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
              <div>
                <label>Schedule Date:</label>
                <DatePicker
                  selected={filters.scheduleDateRange[0]}
                  onChange={date => setFilters({ ...filters, scheduleDateRange: date })}
                  startDate={filters.scheduleDateRange[0]}
                  endDate={filters.scheduleDateRange[1]}
                  selectsRange
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div>
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
          </>
        )}
      </div>
      <div className="filter-tabs">
        <button className="filter-button" onClick={() => handleFilterChange('All Items')}>All Items</button>
        <button className="filter-button" onClick={() => handleFilterChange('Service Items')}>Service Items</button>
        <button className="filter-button" onClick={() => handleFilterChange('T&M Items')}>T&M Items</button>
        <button className="filter-button" onClick={() => handleFilterChange('Recommended Actions')}>Recommended Actions</button>
      </div>
      <div className="table-container">
        <table className="issue-table">
          <thead>
            <tr>
              <th>Item#</th>
              <th>Project Name</th>
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
            </tr>
          </thead>
          <tbody>
            {getFilteredIssues().map((issue, index) => (
              <tr key={issue.id} onClick={() => handleRowClick(issue)}>
                <td>{index + 1}</td>
                <td>{getProjectName(issue.project)}</td>
                <td className="truncate-text">{issue.issueDescription}</td>
                <td>{issue.siteBuilding}</td>
                <td>{issue.requestedBy}</td>
                <td>{new Date(issue.createdDate).toLocaleDateString()}</td>
                <td>{issue.label}</td>
                <td>{issue.attachedFile ? issue.attachedFile.name : 'N/A'}</td>
                <td>{issue.priority}</td>
                <td>{new Date(issue.scheduleDate).toLocaleDateString()}</td>
                <td>{new Date(issue.dateOfService).toLocaleDateString()}</td>
                <td>{issue.engineer}</td>
                <td className="truncate-text">{issue.activities}</td>
                <td>{issue.serviceType}</td>
                <td>{issue.hours}</td>
                <td className={getStatusClassName(issue.status)}>{issue.status}</td>
                <td>{new Date(issue.lastUpdated).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {showModal && (
          <IssueModal
            content={modalContent}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default KpiComponent;
