import React from 'react';
import '../App.css';

const Home = ({ isAuthenticated, loginToClientPortal, loginToTritonPortal }) => {
  return (
    <div className="home-container">
      <h1>Welcome to Triton Concepts Service Portal</h1>
      <p>
        {!isAuthenticated && (
          <>
            <button className="login-button" onClick={loginToClientPortal}>Login to Client Portal</button>
            <button className="login-button" onClick={loginToTritonPortal}>Login to Triton Portal</button>
          </>
        )}
      </p>
      <p>For inquiries, feedback, or support, please visit our <a href="https://www.triton-concepts.com/contact/" className="contact-link" target="_blank" rel="noopener noreferrer">Contact Us</a> page.</p>
    </div>
  );
};

export default Home;