import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './components/Home';
import TritonPortal from './components/TritonPortal';
import ClientPortal from './components/ClientPortal';
import IssueDetails from './components/IssueDetails';
import logo from './triton-logo.png';
import './App.css';
import RequireRole from './components/RequireRole';

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </button>
  );
};

function App() {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();

  const loginToClientPortal = () => {
    loginWithRedirect({
      appState: { targetUrl: '/client' }
    });
  };

  const loginToTritonPortal = () => {
    loginWithRedirect({
      appState: { targetUrl: '/triton' }
    });
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <img src={logo} alt="Triton Logo" className="app-logo" />
          <h1>Service Portal</h1>
        </header>
        <nav className="app-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li onClick={() => !isAuthenticated && loginWithRedirect()}><Link to="/client">Client Portal</Link></li>
            <li onClick={() => !isAuthenticated && loginWithRedirect()}><Link to="/triton">Admin Portal</Link></li>
          </ul>
          {isAuthenticated && (
            <div className="nav-user-info">
              <span className="user-name">Welcome, {user.name}</span>
              <LogoutButton />
            </div>
          )}
        </nav>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} loginToClientPortal={loginToClientPortal} loginToTritonPortal={loginToTritonPortal} />} />
            <Route path="/client" element={
              <RequireRole roles={['user']}>
                <ClientPortal />
              </RequireRole>
            } />
            <Route path="/triton" element={
              <RequireRole roles={['admin', 'engineer']}>
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
