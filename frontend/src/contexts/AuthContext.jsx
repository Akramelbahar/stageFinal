import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedPermissions = localStorage.getItem('permissions');
        
        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            if (storedPermissions) {
              setPermissions(JSON.parse(storedPermissions));
            }
            
            // Verify token validity by getting fresh user data
            try {
              await getCurrentUser();
            } catch (error) {
              // If token is invalid, clear localStorage
              console.warn('Token validation failed, logging out');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('permissions');
              setUser(null);
              setPermissions({});
              setError('Session expirée. Veuillez vous reconnecter.');
            }
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
          }
        }
      } catch (err) {
        console.error('Failed to initialize authentication:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin(username, password);
      setUser(response.user);
      setPermissions(response.permissions || {});
      return response;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Échec de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Always clear user data
      setUser(null);
      setPermissions({});
      setLoading(false);
    }
  };

  const hasPermission = useCallback((permission) => {
    return !!permissions[permission];
  }, [permissions]);

  const hasRole = useCallback((roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.nom === roleName);
  }, [user]);

  const isAdmin = useCallback(() => {
    return hasRole('Admin');
  }, [hasRole]);

  const refreshUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData.user);
      setPermissions(userData.permissions || {});
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const contextValue = {
    user,
    permissions,
    loading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;