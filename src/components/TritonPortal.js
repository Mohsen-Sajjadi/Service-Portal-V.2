import React, { useState, useEffect, useRef, useCallback} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../App.css';
import IssueForm from './IssueForm';
import { downloadCSV } from '../utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import IssueModal from './IssueModal';
import KpiComponent from './KpiComponent';


const TritonPortalComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [project, setProject] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [totalServiceHours, setTotalServiceHours] = useState(0);
  const [engineers, setEngineers] = useState([]);  // State to hold engineers
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [selectedEngineer] = useState(null);
  const [engineerName, setEngineerName] = useState('');
  const [engineerEmail, setEngineerEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [projectIssues, setProjectIssues] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Define isEditing
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
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
    console.log("Authenticated:", isAuthenticated);
    console.log("Roles:", user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      return; // Optionally handle a redirect here or show a message
    }

    if (isAuthenticated && user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].includes('admin')) {
      fetchProjects();
      fetchEngineers();
    } else {
      console.log("User is not an admin or not authenticated.");
    }
  }, [isAuthenticated, isLoading, user]); 

  useEffect(() => {
    if (showIssueForm) {
      issueFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showIssueForm]);

  useEffect(() => {
    fetchProjects();
  }, []);

  
  const fetchProjects = () => {
    fetch('http://localhost:3001/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('Error fetching projects:', error));
  };

  useEffect(() => {
    fetch('http://localhost:3001/engineers')
      .then(response => response.json())
      .then(data => setEngineers(data))
      .catch(error => console.error('Error fetching engineers:', error));

    fetchProjects();
  }, []);

  const fetchProjectById = (projectId) => {
    console.log(`Fetching project details for project ID: ${projectId}`); // Debugging log
    fetch(`http://localhost:3001/projects/${projectId}`)
      .then(response => response.json())
      .then(data => {
        console.log('Project data fetched:', data); // Debugging log
        setProject(data);
        setIsEditing(true); // Set editing mode when a project is selected
      })
      .catch(error => console.error('Error fetching project:', error));
  };

  const fetchProjectIssues = useCallback((projectId) => {
    fetch(`http://localhost:3001/issues?project=${projectId}`)
      .then(response => response.json())
      .then(data => {
        setProjectIssues(data);
        calculateTotalServiceHours(data); // Calculate total hours whenever issues are fetched
      })
      .catch(error => console.error('Error fetching project issues:', error));
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectIssues(selectedProjectId);
    }
  }, [selectedProjectId, fetchProjectIssues]);

  const calculateTotalServiceHours = (issues) => {
    const totalHours = issues.reduce((total, issue) => {
      const hours = parseFloat(issue.hours) || 0;
      return total + hours;
    }, 0);
    setTotalServiceHours(totalHours);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prevProject => ({ ...prevProject, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = `http://localhost:3001/projects${isEditing ? `/${project.id}` : ''}`;
    fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    })
    .then(() => {
      fetchProjects();
      setShowIssueForm(false); // Close form on submit
      setSuccessMessage(isEditing ? 'Project updated successfully!' : 'Project added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (!isEditing) setProject({}); // Reset project state if adding a new project
    })
    .catch(error => console.error('Error saving project:', error));
  };

  const handleSelectProject = (e) => {
    const projectId = e.target.value;
    console.log(`Selected Project ID: ${projectId}`); // Debugging log
    setSelectedProjectId(projectId);
    if (projectId === '') {
      setProject({});
      setProjectIssues([]);
      setIsEditing(false);
      console.log('No project selected, resetting state.'); // Debugging log
    } else {
      fetchProjectById(projectId); // Fetch project details
      fetchProjectIssues(projectId); // Fetch project issues
    }
  };

  const fetchEngineers = () => {
    fetch('http://localhost:3001/engineers')
      .then(response => response.json())
      .then(data => {
        setEngineers(data);
        console.log('Engineers fetched:', data);
      })
      .catch(error => console.error('Error fetching engineers:', error));
  };

  useEffect(() => {
    fetchEngineers(); // Make sure engineers are fetched
  }, []);

  useEffect(() => {
    if (selectedEngineer) {
      setEngineerName(selectedEngineer.name);
      setEngineerEmail(selectedEngineer.email);
    } else {
      setEngineerName('');
      setEngineerEmail('');
    }
  }, [selectedEngineer]);

  const handleChangeEngineer = (e) => {
    const selectedId = e.target.value;
    setSelectedEngineerId(selectedId);
    const engineer = engineers.find((eng) => eng.id.toString() === selectedId);
    if (engineer) {
      setEngineerName(engineer.name);
      setEngineerEmail(engineer.email);
    } else {
      handleClearForm();
    }
  };
  
  const handleClearForm = () => {
    setSelectedEngineerId('');
    setEngineerName('');
    setEngineerEmail('');
  };
  
  const handleEngineerSubmit = (event) => {
    event.preventDefault();
    const engineerData = { name: engineerName, email: engineerEmail };
    const url = selectedEngineerId ? `http://localhost:3001/engineers/${selectedEngineerId}` : 'http://localhost:3001/engineers';
    fetch(url, {
      method: selectedEngineerId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(engineerData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Engineer saved:', data);
      fetchEngineers(); // Refresh the engineers list
      handleClearForm(); // Reset form after submission
    })
    .catch(error => console.error('Error saving engineer:', error));
  };

  // Define the functions mentioned in the errors
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProject({});
  };

  const handleEditProject = (projectId) => {
    setSelectedProjectId(projectId);
    fetchProjectById(projectId);
  };

  const handleRemoveProject = (projectId) => {
    // Display confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to remove this project?");
  
    if (isConfirmed) {
      // Proceed with the removal if the user confirms
      fetch(`http://localhost:3001/projects/${projectId}`, { method: 'DELETE' })
        .then(() => {
          setSuccessMessage('Project removed successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          fetchProjects(); // Refresh the projects list
          setProject({});
          setSelectedProjectId(''); // Reset selected project ID
          setIsEditing(false);
        })
        .catch(error => console.error('Error removing project:', error));
    } else {
      // Do nothing if the user cancels the action
      console.log("Removal cancelled.");
    }
  };

  const openNewIssueForm = () => {
    setSelectedIssue(null); // Reset selected issue
    setShowIssueForm(true); // Ensure form is visible
  };

  const hideIssueForm = () => {
    setShowIssueForm(false);
  };

  const handleEditIssue = (issue, e) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedIssue(issue);
    setShowIssueForm(true);
  };

  const getStatusClassName = (status) => {
    console.log("Received status:", status); // Logs the status received
    switch (status) {
        case 'Open':
            console.log('Applying class: status-open');
            return 'status-open';
        case 'In Progress':
            console.log('Applying class: status-in-progress');
            return 'status-in-progress';
        case 'Cancelled':
            console.log('Applying class: status-cancelled');
            return 'status-cancelled';
        case 'Resolved':
            console.log('Applying class: status-resolved');
            return 'status-resolved';
        default:
            console.log('Applying default class');
            return ''; // Default class if status is unrecognized
    }
};

  const handleRemoveIssue = (issueId) => {
    const isConfirmed = window.confirm("Are you sure you want to remove this issue?");
    if (isConfirmed) {
      fetch(`http://localhost:3001/issues/${issueId}`, { method: 'DELETE' })
        .then(response => {
          if (response.ok) {
            setSuccessMessage('Issue removed successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            // Refresh the issues list
            fetchProjectIssues(selectedProjectId);
            // Close the form
            setShowIssueForm(false); // This line closes the form upon successful deletion
          } else {
            console.error('Failed to delete the issue.');
          }
        })
        .catch(error => console.error('Error removing issue:', error));
    }
  };

  // Use handleIssueSubmitSuccess function to update issues after submission
  const handleIssueSubmitSuccess = () => {
    fetchProjectIssues(selectedProjectId); // Fetch updated list of issues
  };

  // Function to find project name by ID
  const getProjectNameById = (projectId) => {
    const project = projects.find(proj => proj.id.toString() === projectId.toString());
    return project ? project.project : 'Unknown Project';
  };

// Function to format current date as YYYY-MM-DD
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
    projectName: getProjectNameById(issue.project), // Add the project name
    project: undefined // Optionally remove the project ID if it's not needed
  }));
};

// Adjusted button onClick handler for downloading issues CSV
const handleDownloadIssuesCSV = () => {
  // Debugging: Log the projects and selectedProjectId to see what they contain
  console.log('Projects:', projects);
  console.log('Selected Project ID:', selectedProjectId);

  // Find the project using the selectedProjectId
  const selectedProject = projects.find(proj => proj.id === parseInt(selectedProjectId, 10));

  // Check if selectedProject is undefined
  if (!selectedProject) {
    console.error('Selected project not found.');
    return; // Stop the function if no project is found
  }

  const projectName = selectedProject.project;
  const dateStr = formatDate(new Date());
  const filename = `${projectName.replace(/ /g, '_')}_${dateStr}.csv`; // Create a file name with the project name and current date
  console.log(`Downloading CSV as: ${filename}`);
  
  // Assuming 'prepareIssuesForDownload' returns the correct format for your CSV
  const preparedIssues = prepareIssuesForDownload(projectIssues); // Use 'projectIssues' if it holds the correct issues
  downloadCSV(preparedIssues, filename);
};

console.log(selectedProjectId); // Check the selectedProjectId value
console.log(projects); // Log the entire projects array to inspect IDs

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
    (!filters.siteBuilding || issue.siteBuilding.toLowerCase().includes(filters.siteBuilding.toLowerCase())) &&
    (!filters.requestedBy || issue.requestedBy.toLowerCase().includes(filters.requestedBy.toLowerCase())) &&
    (!filters.createdDateStart || (createdDate && createdDate >= new Date(filters.createdDateStart))) &&
    (!filters.createdDateEnd || (createdDate && createdDate <= new Date(filters.createdDateEnd))) &&
    (!filters.label || issue.label === filters.label) &&
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


// Function to handle row click to open the modal
const handleRowClick = (issue) => {
  setModalContent(issue);
  setShowModal(true);
};

const formatDateToLocal = (isoDateString) => {
  const date = new Date(isoDateString);
  return date.toLocaleString(); // Converts to local date and time string
};

const handleFilterChange = (filter) => {
  setCurrentFilter(filter);
};
  return (
    <div className="app-container">
      <h1>Triton Portal</h1>
      <Tabs className="custom-tabs">
        <TabList className="custom-tab-list">
          <Tab className="custom-tab">Add/Edit Project</Tab>
          <Tab className="custom-tab">Engineers</Tab>
          <Tab className="custom-tab">View Projects</Tab>
          <Tab className="custom-tab">KPI and Reports</Tab>
        </TabList>


        <TabPanel>
          {successMessage && <div className="success-message">{successMessage}</div>}
          <form onSubmit={handleSubmit} className="form">
  <input type="text" name="project" value={project.project || ''} placeholder="Project Name" onChange={handleChange} />
  <input type="text" name="client" value={project.client || ''} placeholder="Client Name" onChange={handleChange} />
  <input type="text" name="address" value={project.address || ''} placeholder="Address" onChange={handleChange} /> 
  <input type="email" name="email" value={project.email || ''} placeholder="Email Address" onChange={handleChange} />
  <input type="date" name="startDate" value={project.startDate || ''} placeholder="Start Date" onChange={handleChange} />
  <input type="date" name="endDate" value={project.endDate || ''} placeholder="End Date" onChange={handleChange} />
  <input type="number" name="totalServiceHoursIncluded" value={project.totalServiceHoursIncluded || ''} placeholder="Total Service Hours Included" onChange={handleChange} />
  <input type="text" name="username" value={project.username || ''} placeholder="Username" onChange={handleChange} />
  {isEditing ? (
              <>
                <button type="button" className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                <button type="submit" className="save-button">Save Changes</button>
              </>
            ) : (
              <button type="submit" className="add-button">Add Project</button>
            )}
          </form>
        </TabPanel>


<TabPanel>
  <div className="engineer-form-container">
    <h2>Engineers</h2>
    <select
      value={selectedEngineerId}
      onChange={handleChangeEngineer}
    >
      <option value="">Select an Engineer</option>
      {engineers.map((engineer) => (
        <option key={engineer.id} value={engineer.id}>
          {engineer.name}
        </option>
      ))}
    </select>
    <button onClick={handleClearForm} style={{ marginLeft: '10px' }}>Add New Engineer</button>

    <form onSubmit={handleEngineerSubmit}>
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={engineerName}
          onChange={(e) => setEngineerName(e.target.value)}
          placeholder="Engineer's Name"
          required
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={engineerEmail}
          onChange={(e) => setEngineerEmail(e.target.value)}
          placeholder="Engineer's Email"
          required
        />
      </div>
      <button type="submit" className="add-button">{selectedEngineerId ? "Update Engineer" : "Add Engineer"}</button>
    </form>
  </div>
</TabPanel>
<TabPanel>
          <h2>View Projects</h2>
          <select onChange={handleSelectProject} value={selectedProjectId}>
            <option value="">Select a Project</option>
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.project}</option>
            ))}
          </select>
          {project.id && (
            <div className="project-details">
            <h3 className="project-details-title">Project Details</h3>
            {/* Display selected project details */}
            <p className="project-detail"><span className="detail-label">Project Name:</span> {project.project}</p>
            <p className="project-detail"><span className="detail-label">Client Name:</span> {project.client}</p>
            <p className="project-detail"><span className="detail-label">Address:</span> {project.address}</p>
            <p className="project-detail"><span className="detail-label">Email:</span> {project.email}</p>
            <p className="project-detail"><span className="detail-label">Start Date:</span> {project.startDate}</p>
            <p className="project-detail"><span className="detail-label">End Date:</span> {project.endDate}</p>
            <p className="project-detail"><span className="detail-label">Total Service Hours Included:</span> {project.totalServiceHoursIncluded}</p>
            <p className="project-detail"><span className="detail-label">Total Service Hours:</span> {totalServiceHours}</p>
              <button className="edit-button" onClick={() => handleEditProject(project.id)}>Edit</button>
              <button className="remove-button" onClick={() => handleRemoveProject(project.id)}>Remove</button>
              <button className="new-request-button" onClick={openNewIssueForm} style={{ display: showIssueForm ? 'none' : 'inline-block' }}>New Request</button>
            </div>
          )}
          {showIssueForm && (
            <>
              <IssueForm
                ref={issueFormRef}
                projectId={selectedProjectId}
                engineers={engineers}  // Pass engineers to IssueForm
                hideForm={hideIssueForm}
                issue={selectedIssue}
                onRemoveIssue={handleRemoveIssue}
                onIssueSubmitSuccess={handleIssueSubmitSuccess}
              />
              <button className="cancel-button" onClick={hideIssueForm}>Cancel</button>
            </>
          )}
          <h3>Service Requests</h3>
          <button className="download-csv-button" onClick={handleDownloadIssuesCSV}>Download CSV</button>
          {/* Filter Bar */}
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
        <option value="Recommended Action">Recommended Action</option>
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
            {/* Date Filters */}
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
                <th>Item#</th> {/* Added this header for the row numbers */}
                {/*<th>IssueID</th>*/}
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
            {filteredIssues.map((issue, index) => ( // 'index' is now defined here
  <tr key={issue.id} onClick={() => handleRowClick(issue)}>
    <td>{index + 1}</td> {/* This cell will show the row number */}
    {/*<td>{issue.id}</td>*/}
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
          e.stopPropagation(); // Prevents the modal from opening when the edit button is clicked
          handleEditIssue(issue, e);
        }}>Edit
      </button>
    </td>
  </tr>
))}
</tbody>
</table>
</TabPanel>
<TabPanel>
  <KpiComponent />
</TabPanel>

</Tabs>

{/* Modal for displaying issue details */}
{showModal && (
  <IssueModal
    content={modalContent}
    onClose={() => setShowModal(false)}
  />
)}
</div>
  );
};
export default TritonPortalComponent; 