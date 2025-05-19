import api from './index';

// Get all diagnostics
export const getAllDiagnostics = async () => {
  try {
    const response = await api.get('/diagnostics');
    return response.data;
  } catch (error) {
    console.error('Error fetching diagnostics:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des diagnostics' };
  }
};

// Get a specific diagnostic by ID
export const getDiagnosticById = async (id) => {
  try {
    const response = await api.get(`/diagnostics/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching diagnostic:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération du diagnostic' };
  }
};

// Get diagnostic for a specific intervention
export const getDiagnosticByIntervention = async (interventionId) => {
  try {
    const response = await api.get(`/diagnostics/intervention/${interventionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching diagnostic by intervention:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération du diagnostic pour cette intervention' };
  }
};

// Create a new diagnostic
export const createDiagnostic = async (diagnosticData) => {
  try {
    const response = await api.post('/diagnostics', diagnosticData);
    return response.data;
  } catch (error) {
    console.error('Error creating diagnostic:', error);
    throw error.response?.data || { message: 'Erreur lors de la création du diagnostic' };
  }
};

// Update an existing diagnostic
export const updateDiagnostic = async (id, diagnosticData) => {
  try {
    const response = await api.put(`/diagnostics/${id}`, diagnosticData);
    return response.data;
  } catch (error) {
    console.error('Error updating diagnostic:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour du diagnostic' };
  }
};

// Delete a diagnostic
export const deleteDiagnostic = async (id) => {
  try {
    const response = await api.delete(`/diagnostics/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting diagnostic:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression du diagnostic' };
  }
};
