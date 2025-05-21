import api from './index';

// Get all interventions
export const getAllInterventions = async () => {
  try {
    const response = await api.get('/interventions');
    return response.data;
  } catch (error) {
    console.error('Error fetching interventions:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions' };
  }
};

// Get a specific intervention by ID
export const getInterventionById = async (id) => {
  try {
    const response = await api.get(`/interventions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching intervention:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération de l\'intervention' };
  }
};

// Get interventions by status
export const getInterventionsByStatus = async (status) => {
  try {
    const response = await api.get(`/interventions/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interventions by status:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions par statut' };
  }
};

// Get urgent interventions
export const getUrgentInterventions = async () => {
  try {
    const response = await api.get('/interventions/urgent');
    return response.data;
  } catch (error) {
    console.error('Error fetching urgent interventions:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions urgentes' };
  }
};

// Get interventions by machine
export const getInterventionsByMachine = async (machineId) => {
  try {
    const response = await api.get(`/interventions/machine/${machineId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interventions by machine:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions pour cette machine' };
  }
};

// Create a new intervention
export const createIntervention = async (interventionData) => {
  try {
    const response = await api.post('/interventions', interventionData);
    return response.data;
  } catch (error) {
    console.error('Error creating intervention:', error);
    throw error.response?.data || { message: 'Erreur lors de la création de l\'intervention' };
  }
};

// Update an existing intervention
export const updateIntervention = async (id, interventionData) => {
  try {
    const response = await api.put(`/interventions/${id}`, interventionData);
    return response.data;
  } catch (error) {
    console.error('Error updating intervention:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'intervention' };
  }
};

// Delete an intervention
export const deleteIntervention = async (id) => {
  try {
    const response = await api.delete(`/interventions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting intervention:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression de l\'intervention' };
  }
};