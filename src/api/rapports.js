import api from './index';

// Get all rapports
export const getAllRapports = async () => {
  try {
    const response = await api.get('/rapports');
    return response.data;
  } catch (error) {
    console.error('Error fetching rapports:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des rapports' };
  }
};

// Get a specific rapport by ID
export const getRapportById = async (id) => {
  try {
    const response = await api.get(`/rapports/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rapport:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération du rapport' };
  }
};

// Get rapports for a specific renovation
export const getRapportsByRenovation = async (renovationId) => {
  try {
    const response = await api.get(`/rapports/renovation/${renovationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rapports by renovation:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des rapports pour cette rénovation' };
  }
};

// Get rapports for a specific maintenance
export const getRapportsByMaintenance = async (maintenanceId) => {
  try {
    const response = await api.get(`/rapports/maintenance/${maintenanceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rapports by maintenance:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des rapports pour cette maintenance' };
  }
};

// Get rapports for a specific prestataire
export const getRapportsByPrestataire = async (prestataireId) => {
  try {
    const response = await api.get(`/rapports/prestataire/${prestataireId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rapports by prestataire:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des rapports pour ce prestataire' };
  }
};

// Create a new rapport
export const createRapport = async (rapportData) => {
  try {
    const response = await api.post('/rapports', rapportData);
    return response.data;
  } catch (error) {
    console.error('Error creating rapport:', error);
    throw error.response?.data || { message: 'Erreur lors de la création du rapport' };
  }
};

// Update an existing rapport
export const updateRapport = async (id, rapportData) => {
  try {
    const response = await api.put(`/rapports/${id}`, rapportData);
    return response.data;
  } catch (error) {
    console.error('Error updating rapport:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour du rapport' };
  }
};

// Validate a rapport
export const validateRapport = async (id) => {
  try {
    const response = await api.put(`/rapports/${id}/validate`);
    return response.data;
  } catch (error) {
    console.error('Error validating rapport:', error);
    throw error.response?.data || { message: 'Erreur lors de la validation du rapport' };
  }
};

// Delete a rapport
export const deleteRapport = async (id) => {
  try {
    const response = await api.delete(`/rapports/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting rapport:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression du rapport' };
  }
};
