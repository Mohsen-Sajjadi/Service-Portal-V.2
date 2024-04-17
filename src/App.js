import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './components/Home';
import TritonPortal from './components/TritonPortal';
import ClientPortal from './components/ClientPortal';
import IssueDetails from './components/IssueDetails';
import logo from './triton-logo.png';
import './App.css';
import RequireRole from './components/RequireRole'; // Ensure this component is correctly imported from its file

function App() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <img src={logo} alt="Triton Logo" className="app-logo" />
          <h1>Triton Concepts Service Portal</h1>
        </header>
        <nav className="app-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li onClick={() => !isAuthenticated && loginWithRedirect()}><Link to="/client">Client Portal</Link></li>
            <li onClick={() => !isAuthenticated && loginWithRedirect()}><Link to="/triton">Triton Portal</Link></li>
          </ul>
        </nav>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/client" element={
              <RequireRole role="user">
                <ClientPortal />
              </RequireRole>
            } />
            <Route path="/triton" element={
              <RequireRole role="admin">
                <TritonPortal />
              </RequireRole>
            } />
            <Route path="/issues/:issueId" element={<IssueDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
