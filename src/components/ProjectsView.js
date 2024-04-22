// ProjectsView.js
import React from 'react';
import IssueForm from './IssueForm';  // Ensure this import path matches your project structure
import DatePicker from 'react-datepicker';  // Ensure DatePicker is installed and imported correctly
import 'react-datepicker/dist/react-datepicker.css';


const ProjectsView = ({ projects, project, totalServiceHours, handleSelectProject, showIssueForm, issueFormRef, openNewIssueForm, hideIssueForm, selectedProjectId, engineers, selectedIssue, handleRemoveIssue, handleIssueSubmitSuccess, handleEditProject, handleRemoveProject, handleDownloadIssuesCSV, showFilters, setShowFilters, filters, setFilters, getStatusClassName, formatDateToLocal, handleFilterChange, filteredIssues }) => {
    return (
        <div>
            <h2>View Projects</h2>
            <select onChange={handleSelectProject} value={selectedProjectId}>
                <option value="">Select a project</option>
                {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.project}</option>
                ))}
            </select>
            {project.id && (
                <div className="project-details">
                    <h3 className="project-details-title">Project Details</h3>
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
                <IssueForm
                    ref={issueFormRef}
                    projectId={selectedProjectId}
                    engineers={engineers}
                    hideForm={hideIssueForm}
                    issue={selectedIssue}
                    onRemoveIssue={handleRemoveIssue}
                    onIssueSubmitSuccess={handleIssueSubmitSuccess}
                />
            )}
            <h3>Service Requests</h3>
            <button className="download-csv-button" onClick={handleDownloadIssuesCSV}>Download CSV</button>
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
                        <div className="date-filter">
                            {/* Date pickers for filtering */}
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
        </div>
    );
};

export default ProjectsView;
