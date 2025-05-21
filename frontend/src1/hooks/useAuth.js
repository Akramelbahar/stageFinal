import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/auth';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({});

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedPermissions = localStorage.getItem('permissions');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setPermissions(storedPermissions ? JSON.parse(storedPermissions) : {});
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
      }
    }
    
    setLoading(false);
    
    // Verify token and get fresh user data
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const data = await getCurrentUser();
          if (data && data.user) {
            setUser(data.user);
            
            // Format permissions from API response
            const permissionsObj = {};
            if (data.permissions) {
              Object.keys(data.permissions).forEach(key => {
                permissionsObj[key] = true;
              });
            }
            setPermissions(permissionsObj);
          }
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setUser(null);
        setPermissions({});
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
      }
    };
    
    verifyToken();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiLogin(username, password);
      
      if (data && data.user) {
        setUser(data.user);
        
        // Format permissions from API response
        const permissionsObj = {};
        if (data.permissions) {
          Object.keys(data.permissions).forEach(key => {
            permissionsObj[key] = true;
          });
        }
        setPermissions(permissionsObj);
        return data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setPermissions({});
      setLoading(false);
    }
  };

  // CRUCIAL: Check if user is admin
  const isAdmin = useCallback(() => {
    if (!user || !user.roles) return false;
    
    // Check if any role has the name 'Admin'
    const adminRole = user.roles.find(role => role.nom === 'Admin');
    const isUserAdmin = !!adminRole;
    
    console.log('Admin check:', isUserAdmin, 'User roles:', user.roles);
    return isUserAdmin;
  }, [user]);

  // Function to check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    // DEBUG FOR TESTING - First log what we're checking
    console.log(`Checking permission: ${permission}`);
    
    // If no user is logged in, deny access
    if (!user) {
      console.log('No user logged in - access denied');
      return false;
    }
    
    // ADMIN OVERRIDE: If user has Admin role, ALWAYS return true
    const hasAdminRole = user.roles && user.roles.some(role => role.nom === 'Admin');
    if (hasAdminRole) {
      console.log('User is Admin - automatically granting permission');
      return true;
    }
    
    // For non-admin users, check specific permission
    const hasSpecificPermission = Boolean(permissions[permission]);
    console.log(`Regular permission check for '${permission}':`, hasSpecificPermission);
    return hasSpecificPermission;
  }, [user, permissions]);

  // Debug function with enhanced logging
  const logPermissions = useCallback(() => {
    console.log('--- AUTH DEBUG INFO ---');
    console.log('Current user:', user);
    console.log('Admin check:', isAdmin());
    console.log('User roles:', user?.roles || 'No roles');
    console.log('Permissions object:', permissions);
    console.log('Token in localStorage:', !!localStorage.getItem('token'));
    console.log('----------------------');
  }, [user, permissions, isAdmin]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAdmin,
    permissions,
    logPermissions
  };
};

export default useAuth;