import api from './index';

export const login = async (username, password) => {
  try {
    console.log('Attempting login with:', { nom: username, password });
    const response = await api.post('/login', {
      nom: username,
      password,
    });
    
    console.log('Login response:', response.data);
    
    if (response.data && response.data.token) {
      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Format permissions from the API response for easier access
      const permissionsObj = {};
      if (response.data.permissions) {
        Object.keys(response.data.permissions).forEach(key => {
          permissionsObj[key] = true;
        });
      }
      localStorage.setItem('permissions', JSON.stringify(permissionsObj));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error);
    throw error.response?.data || { message: 'Une erreur est survenue lors de la connexion' };
  }
};

export const logout = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Make the API call with the token
      await api.post('/logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear localStorage even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    return { success: true };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user');
    
    // Update stored user data and permissions
    if (response.data && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Format permissions from the API response
      const permissionsObj = {};
      if (response.data.permissions) {
        Object.keys(response.data.permissions).forEach(key => {
          permissionsObj[key] = true;
        });
      }
      localStorage.setItem('permissions', JSON.stringify(permissionsObj));
    }
    
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des informations utilisateur' };
  }
};

export const checkPermissions = async (permissions) => {
  try {
    const response = await api.post('/check-permissions', { permissions });
    return response.data;
  } catch (error) {
    console.error('Check permissions error:', error);
    throw error.response?.data || { message: 'Erreur lors de la vérification des permissions' };
  }
};