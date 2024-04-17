import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const RequireRole = ({ role, children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();

  // Adding useEffect to log user roles for debugging
  useEffect(() => {
    if (user) {
      console.log("User roles:", user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return <div>Redirecting to login...</div>;
  }

  const userRoles = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
  if (userRoles.includes(role)) {
    return children;
  } else {
    console.log("Access denied: user lacks required role.");
    return <Navigate to="/" replace />;
  }
};

export default RequireRole;
