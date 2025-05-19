import api from './index';

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/utilisateurs');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des utilisateurs' };
  }
};

// Get a specific user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/utilisateurs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération de l\'utilisateur' };
  }
};

// Get users for a specific section
export const getUsersBySection = async (sectionId) => {
  try {
    const response = await api.get(`/utilisateurs/section/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users by section:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des utilisateurs pour cette section' };
  }
};

// Get user permissions
export const getUserPermissions = async (id) => {
  try {
    const response = await api.get(`/utilisateurs/${id}/permissions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des permissions de l\'utilisateur' };
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/utilisateurs', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error.response?.data || { message: 'Erreur lors de la création de l\'utilisateur' };
  }
};

// Update an existing user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/utilisateurs/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'utilisateur' };
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/utilisateurs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression de l\'utilisateur' };
  }
};

// Assign roles to a user
export const assignRolesToUser = async (id, roleIds) => {
  try {
    const response = await api.post(`/utilisateurs/${id}/roles`, { roles: roleIds });
    return response.data;
  } catch (error) {
    console.error('Error assigning roles to user:', error);
    throw error.response?.data || { message: 'Erreur lors de l\'attribution des rôles à l\'utilisateur' };
  }
};

// Create admin user
export const createAdminUser = async () => {
  try {
    const response = await api.post('/utilisateurs/create-admin');
    return response.data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error.response?.data || { message: 'Erreur lors de la création de l\'utilisateur administrateur' };
  }
};
