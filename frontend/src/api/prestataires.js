import api from './index';
import { extractApiData, processApiResponse, debugApiResponse } from './apiHelpers';

// Get all prestataires
export const getAllPrestataires = async () => {
  try {
    const response = await api.get('/prestataires');
    debugApiResponse(response, 'getAllPrestataires');
    
    const data = extractApiData(response);
    
    return { 
      data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching prestataires:', error);
    return {
      data: [],
      error: error.response?.data?.message || 'Erreur lors de la récupération des prestataires',
      success: false
    };
  }
};

// Get a specific prestataire by ID
export const getPrestataireById = async (id) => {
  try {
    const response = await api.get(`/prestataires/${id}`);
    debugApiResponse(response, `getPrestataireById(${id})`);
    
    // Extract the single prestataire
    let prestataire = {};
    if (response.data) {
      prestataire = typeof response.data === 'object' ? response.data : {};
    }
    
    return { 
      data: prestataire,
      success: true
    };
  } catch (error) {
    console.error('Error fetching prestataire:', error);
    return {
      data: {},
      error: error.response?.data?.message || 'Erreur lors de la récupération du prestataire',
      success: false
    };
  }
};

// Get rapports for a specific prestataire
export const getRapportsByPrestataire = async (id) => {
  try {
    const response = await api.get(`/prestataires/${id}/rapports`);
    debugApiResponse(response, `getRapportsByPrestataire(${id})`);
    
    return { 
      data: extractApiData(response),
      success: true
    };
  } catch (error) {
    console.error('Error fetching prestataire rapports:', error);
    return {
      data: [],
      error: error.response?.data?.message || 'Erreur lors de la récupération des rapports du prestataire',
      success: false
    };
  }
};

// Create a new prestataire
export const createPrestataire = async (prestataireData) => {
  try {
    const response = await api.post('/prestataires', prestataireData);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error creating prestataire:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la création du prestataire',
      success: false
    };
  }
};

// Update an existing prestataire
export const updatePrestataire = async (id, prestataireData) => {
  try {
    const response = await api.put(`/prestataires/${id}`, prestataireData);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error updating prestataire:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la mise à jour du prestataire',
      success: false
    };
  }
};

// Assign users to a prestataire
export const assignUsersToPrestataire = async (id, userIds) => {
  try {
    const response = await api.post(`/prestataires/${id}/users`, { user_ids: userIds });
    return processApiResponse(response);
  } catch (error) {
    console.error('Error assigning users to prestataire:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de l\'assignation des utilisateurs au prestataire',
      success: false
    };
  }
};

// Delete a prestataire
export const deletePrestataire = async (id) => {
  try {
    const response = await api.delete(`/prestataires/${id}`);
    return processApiResponse(response);
  } catch (error) {
    console.error('Error deleting prestataire:', error);
    return {
      data: null,
      error: error.response?.data?.message || 'Erreur lors de la suppression du prestataire',
      success: false
    };
  }
};