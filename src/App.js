import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import TritonPortal from './components/TritonPortal';
import ClientPortal from './components/ClientPortal';
import Auth0ProviderWithHistory from './auth/auth0-config';
import IssueDetails from './components/IssueDetails'; // Make sure the path to IssueDetails is correct
import logo from './triton-logo.png'; // Importing the logo
import './App.css'; // Ensure your CSS file is imported


function App() {
  return (
    <Router>
      <Auth0ProviderWithHistory>
        <div className="app-container">
          <header className="app-header">
            <img src={logo} alt="Triton Logo" className="app-logo" />
            <h1>Triton Concepts Service Portal</h1>
          </header>
          <nav className="app-nav">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/client">Client Portal</Link></li>
              <li><Link to="/triton">Triton Portal</Link></li>
            </ul>
          </nav>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/client" element={<ClientPortal />} />
              <Route path="/triton" element={<TritonPortal />} />
              <Route path="/issues/:issueId" element={<IssueDetails />} />
            </Routes>
          </main>
        </div>
      </Auth0ProviderWithHistory>
    </Router>
  );
}

export default App;
