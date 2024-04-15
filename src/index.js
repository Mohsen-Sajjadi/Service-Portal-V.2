import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Auth0ProviderWithHistory from './auth/auth0-config'; // Adjust the path as necessary

ReactDOM.render(
  <React.StrictMode>
    <Auth0ProviderWithHistory>
      <App />
    </Auth0ProviderWithHistory>
  </React.StrictMode>,
  document.getElementById('root')
);