import api from './index';
import { extractApiData, processApiResponse, debugApiResponse, fixEntityIds } from './apiHelpers';

// Get all maintenances
export const getAllMaintenances = async () => {
  try {
    const response = await api.get('/maintenances');
    debugApiResponse(response, 'getAllMaintenances');
    
    // Process and fix IDs
    const data = fixEntityIds(extractApiData(response), 'maintenances');
    
    return { 
      data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    return {
      data: [],
      error: error.response?.data?.message || 'Erreur lors de la récupération des maintenances',
      success: false
    };
  }
};

// Get a specific maintenance by ID
export const getMaintenanceById = async (id) => {
  try {
    const response = await api.get(`/maintenances/${id}`);
    debugApiResponse(response, `getMaintenanceById(${id})`);
    
    // Extract the single maintenance
    let maintenance = {};
    if (response.data) {
      maintenance = typeof response.data === 'object' ? response.data : {};
      
      // Fix ID if needed
      if (maintenance.intervention && maintenance.intervention.id && !maintenance.intervention_id) {
        maintenance.intervention_id = maintenance.intervention.id;
      }
    }
    
    return { 
      data: maintenance,
      success: true
    };
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return {
      data: {},
      error: error.response?.data?.message || 'Erreur lors de la récupération de la maintenance',
      success: false
    };
  }
};

// Get maintenance by intervention ID
export const getMaintenanceByIntervention = async (interventionId) => {
  try {
    const response = await api.get(`/maintenances/intervention/${interventionId}`);
    debugApiResponse(response, `getMaintenanceByIntervention(${interventionId})`);
    
    // Extract the single maintenance
    let maintenance = {};
    if (response.data) {
      maintenance = typeof response.data === 'object' ? response.data : {};
      
      // Fix ID if needed
      if (!maintenance.intervention_id) {
        maintenance.intervention_id = interventionId;
      }
    }
    
    return { 
      data: maintenance,
      success: true
    };
  } catch (error) {
    console.error('Error fetching maintenance by intervention:', error);
    return {
      data: {},
      error: error.response?.data?.message || 'Erreur lors de la récupération de la maintenance pour cette intervention',
      success: false
    };
  }
};

// Get maintenance statistics
export const getMaintenanceStatistics = async () => {
  try {
    const response = await api.get('/maintenances/statistics');
    return processApiResponse(response);
  } catch (error) {
    console.error('Error fetching maintenance statistics:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques de maintenance',
      success: false
    };
  }
};

// Create a new maintenance
export const createMaintenance = async (maintenanceData) => {
  try {
    const response = await api.post('/maintenances', maintenanceData);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la création de la maintenance',
      success: false
    };
  }
};

// Update an existing maintenance
export const updateMaintenance = async (id, maintenanceData) => {
  try {
    const response = await api.put(`/maintenances/${id}`, maintenanceData);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la mise à jour de la maintenance',
      success: false
    };
  }
};

// Mark a maintenance as complete
export const completeMaintenance = async (id) => {
  try {
    const response = await api.put(`/maintenances/${id}/complete`);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error completing maintenance:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la finalisation de la maintenance',
      success: false
    };
  }
};

// Delete a maintenance
export const deleteMaintenance = async (id) => {
  try {
    const response = await api.delete(`/maintenances/${id}`);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la suppression de la maintenance',
      success: false
    };
  }
};