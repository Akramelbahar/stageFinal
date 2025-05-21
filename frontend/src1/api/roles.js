import api from './index';

// Get all roles
export const getAllRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des rôles' };
  }
};

// Get a specific role by ID
export const getRoleById = async (id) => {
  try {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération du rôle' };
  }
};

// Get users with a specific role
export const getUsersByRole = async (id) => {
  try {
    const response = await api.get(`/roles/${id}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des utilisateurs ayant ce rôle' };
  }
};

// Create a new role
export const createRole = async (roleData) => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error.response?.data || { message: 'Erreur lors de la création du rôle' };
  }
};

// Update an existing role
export const updateRole = async (id, roleData) => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour du rôle' };
  }
};

// Delete a role
export const deleteRole = async (id) => {
  try {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression du rôle' };
  }
};

// Assign permissions to a role
export const assignPermissionsToRole = async (id, permissionIds) => {
  try {
    const response = await api.post(`/roles/${id}/permissions`, permissionIds);
    return response.data;
  } catch (error) {
    console.error('Error assigning permissions to role:', error);
    throw error.response?.data || { message: 'Erreur lors de l\'attribution des permissions au rôle' };
  }
};

// Create admin role
export const createAdminRole = async () => {
  try {
    const response = await api.post('/roles/create-admin');
    return response.data;
  } catch (error) {
    console.error('Error creating admin role:', error);
    throw error.response?.data || { message: 'Erreur lors de la création du rôle administrateur' };
  }
};

// Get all permissions
export const getAllPermissions = async () => {
  try {
    const response = await api.get('/permissions');
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des permissions' };
  }
};

// Get permissions by module
export const getPermissionsByModule = async (module) => {
  try {
    const response = await api.get(`/permissions/module/${module}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions by module:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des permissions pour ce module' };
  }
};

// Get all permission modules
export const getAllPermissionModules = async () => {
  try {
    const response = await api.get('/permissions/modules');
    return response.data;
  } catch (error) {
    console.error('Error fetching permission modules:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des modules de permission' };
  }
};

// Generate CRUD permissions for a module
export const generateCRUDPermissions = async (module) => {
  try {
    const response = await api.post('/permissions/generate-crud', { module });
    return response.data;
  } catch (error) {
    console.error('Error generating CRUD permissions:', error);
    throw error.response?.data || { message: 'Erreur lors de la génération des permissions CRUD' };
  }
};