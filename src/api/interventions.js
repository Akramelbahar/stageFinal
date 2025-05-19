import api from './index';

export const getAllInterventions = async () => {
  try {
    const response = await api.get('/interventions');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions' };
  }
};

export const getInterventionById = async (id) => {
  try {
    const response = await api.get(`/interventions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération de l\'intervention' };
  }
};

export const getInterventionsByStatus = async (status) => {
  try {
    const response = await api.get(`/interventions/status/${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions par statut' };
  }
};

export const getInterventionsByMachine = async (machineId) => {
  try {
    const response = await api.get(`/interventions/machine/${machineId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions par machine' };
  }
};

export const getUrgentInterventions = async () => {
  try {
    const response = await api.get('/interventions/urgent');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions urgentes' };
  }
};

export const createIntervention = async (interventionData) => {
  try {
    const response = await api.post('/interventions', interventionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la création de l\'intervention' };
  }
};

export const updateIntervention = async (id, interventionData) => {
  try {
    const response = await api.put(`/interventions/${id}`, interventionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'intervention' };
  }
};

export const deleteIntervention = async (id) => {
  try {
    const response = await api.delete(`/interventions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la suppression de l\'intervention' };
  }
};

// Additional functions for specific intervention types

export const assignUsersToIntervention = async (interventionId, userIds) => {
  try {
    const response = await api.post(`/interventions/${interventionId}/users`, { utilisateurs: userIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de l\'attribution des utilisateurs à l\'intervention' };
  }
};

export const completeIntervention = async (interventionId, completionData) => {
  try {
    const response = await api.put(`/interventions/${interventionId}/complete`, completionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la finalisation de l\'intervention' };
  }
};
