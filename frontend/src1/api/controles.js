import api from './index';

// Get all controles
export const getAllControles = async () => {
  try {
    const response = await api.get('/controles');
    return response.data;
  } catch (error) {
    console.error('Error fetching controles:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des contrôles' };
  }
};

// Get a specific controle by ID
export const getControleById = async (id) => {
  try {
    const response = await api.get(`/controles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching controle:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération du contrôle' };
  }
};

// Get controle for a specific intervention
export const getControleByIntervention = async (interventionId) => {
  try {
    const response = await api.get(`/controles/intervention/${interventionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching controle by intervention:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération du contrôle pour cette intervention' };
  }
};

// Create a new controle
export const createControle = async (controleData) => {
  try {
    const response = await api.post('/controles', controleData);
    return response.data;
  } catch (error) {
    console.error('Error creating controle:', error);
    throw error.response?.data || { message: 'Erreur lors de la création du contrôle' };
  }
};

// Update an existing controle
export const updateControle = async (id, controleData) => {
  try {
    const response = await api.put(`/controles/${id}`, controleData);
    return response.data;
  } catch (error) {
    console.error('Error updating controle:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour du contrôle' };
  }
};

// Delete a controle
export const deleteControle = async (id) => {
  try {
    const response = await api.delete(`/controles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting controle:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression du contrôle' };
  }
};