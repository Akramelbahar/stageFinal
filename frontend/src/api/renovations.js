import api from './index';
import { extractApiData, processApiResponse, debugApiResponse, fixEntityIds } from './apiHelpers';

// Get all renovations
export const getAllRenovations = async () => {
  try {
    const response = await api.get('/renovations');
    debugApiResponse(response, 'getAllRenovations');
    
    // Process and fix IDs
    const data = fixEntityIds(extractApiData(response), 'renovations');
    
    return { 
      data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching renovations:', error);
    return {
      data: [],
      error: error.response?.data?.message || 'Erreur lors de la récupération des rénovations',
      success: false
    };
  }
};

// Get a specific renovation by ID
export const getRenovationById = async (id) => {
  try {
    const response = await api.get(`/renovations/${id}`);
    debugApiResponse(response, `getRenovationById(${id})`);
    
    // Extract the single renovation
    let renovation = {};
    if (response.data) {
      renovation = typeof response.data === 'object' ? response.data : {};
      
      // Fix ID if needed
      if (renovation.intervention && renovation.intervention.id && !renovation.intervention_id) {
        renovation.intervention_id = renovation.intervention.id;
      }
    }
    
    return { 
      data: renovation,
      success: true
    };
  } catch (error) {
    console.error('Error fetching renovation:', error);
    return {
      data: {},
      error: error.response?.data?.message || 'Erreur lors de la récupération de la rénovation',
      success: false
    };
  }
};

// Get renovation by intervention ID
export const getRenovationByIntervention = async (interventionId) => {
  try {
    const response = await api.get(`/renovations/intervention/${interventionId}`);
    debugApiResponse(response, `getRenovationByIntervention(${interventionId})`);
    
    // Extract the single renovation
    let renovation = {};
    if (response.data) {
      renovation = typeof response.data === 'object' ? response.data : {};
      
      // Fix ID if needed
      if (!renovation.intervention_id) {
        renovation.intervention_id = interventionId;
      }
    }
    
    return { 
      data: renovation,
      success: true
    };
  } catch (error) {
    console.error('Error fetching renovation by intervention:', error);
    return {
      data: {},
      error: error.response?.data?.message || 'Erreur lors de la récupération de la rénovation pour cette intervention',
      success: false
    };
  }
};

// Create a new renovation
export const createRenovation = async (renovationData) => {
  try {
    const response = await api.post('/renovations', renovationData);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error creating renovation:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la création de la rénovation',
      success: false
    };
  }
};

// Update an existing renovation
export const updateRenovation = async (id, renovationData) => {
  try {
    const response = await api.put(`/renovations/${id}`, renovationData);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error updating renovation:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la mise à jour de la rénovation',
      success: false
    };
  }
};

// Delete a renovation
export const deleteRenovation = async (id) => {
  try {
    const response = await api.delete(`/renovations/${id}`);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error deleting renovation:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la suppression de la rénovation',
      success: false
    };
  }
};