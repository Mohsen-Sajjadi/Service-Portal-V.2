import React from 'react';
import '../App.css'; // Assuming you have this CSS file for styling

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Triton Concepts Service Portal</h1>
      <p>For inquiries, feedback, or support, please visit our <a href="https://www.triton-concepts.com/contact/" className="contact-link" target="_blank" rel="noopener noreferrer">Contact Us</a> page.</p>
    </div>
  );
};

export default Home;