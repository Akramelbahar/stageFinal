import api from './index';

// Get all planifications
export const getAllPlanifications = async () => {
  try {
    const response = await api.get('/planifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching planifications:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des planifications' };
  }
};

// Get a specific planification by ID
export const getPlanificationById = async (id) => {
  try {
    const response = await api.get(`/planifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching planification:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération de la planification' };
  }
};

// Get planifications for a specific user
export const getPlanificationsByUser = async (userId) => {
  try {
    const response = await api.get(`/planifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching planifications by user:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des planifications pour cet utilisateur' };
  }
};

// Create a new planification
export const createPlanification = async (planificationData) => {
  try {
    const response = await api.post('/planifications', planificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating planification:', error);
    throw error.response?.data || { message: 'Erreur lors de la création de la planification' };
  }
};

// Update an existing planification
export const updatePlanification = async (id, planificationData) => {
  try {
    const response = await api.put(`/planifications/${id}`, planificationData);
    return response.data;
  } catch (error) {
    console.error('Error updating planification:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour de la planification' };
  }
};

// Delete a planification
export const deletePlanification = async (id) => {
  try {
    const response = await api.delete(`/planifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting planification:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression de la planification' };
  }
};

// Add an intervention to a planification
export const addInterventionToPlanification = async (planificationId, interventionId) => {
  try {
    const response = await api.post(`/planifications/${planificationId}/interventions`, {
      intervention_id: interventionId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding intervention to planification:', error);
    throw error.response?.data || { message: 'Erreur lors de l\'ajout de l\'intervention à la planification' };
  }
};

// Remove an intervention from a planification
export const removeInterventionFromPlanification = async (planificationId, interventionId) => {
  try {
    const response = await api.delete(`/planifications/${planificationId}/interventions/${interventionId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing intervention from planification:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression de l\'intervention de la planification' };
  }
};
