import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading, isAdmin, hasPermission, logPermissions } = useAuth();
  const location = useLocation();

  // Enhanced debugging
  useEffect(() => {
    console.log('--- PROTECTED ROUTE DEBUG ---');
    console.log('Path:', location.pathname);
    console.log('Required permission:', requiredPermission);
    console.log('User authenticated:', !!user);
    
    if (user) {
      console.log('User is admin?', isAdmin());
      if (requiredPermission) {
        console.log(`Has permission '${requiredPermission}'?`, hasPermission(requiredPermission));
      }
      logPermissions();
    }
    console.log('----------------------------');
  }, [location.pathname, requiredPermission, user, isAdmin, hasPermission, logPermissions]);

  // Show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    console.log('Not logged in - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ADMIN OVERRIDE - Always grant access to admin users
  if (user.roles && user.roles.some(role => role.nom === 'Admin')) {
    console.log('ADMIN USER DETECTED - GRANTING ACCESS');
    return children;
  }

  // For non-admin users, check the required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log(`Permission denied: ${requiredPermission} - redirecting to forbidden page`);
    return <Navigate to="/forbidden" replace />;
  }

  // Allow access
  console.log('Access granted');
  return children;
};

export default ProtectedRoute;