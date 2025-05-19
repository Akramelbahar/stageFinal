import api from './index';

// Get all sections
export const getAllSections = async () => {
  try {
    const response = await api.get('/sections');
    return response.data;
  } catch (error) {
    console.error('Error fetching sections:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des sections' };
  }
};

// Get a specific section by ID
export const getSectionById = async (id) => {
  try {
    const response = await api.get(`/sections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching section:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération de la section' };
  }
};

// Create a new section
export const createSection = async (sectionData) => {
  try {
    const response = await api.post('/sections', sectionData);
    return response.data;
  } catch (error) {
    console.error('Error creating section:', error);
    throw error.response?.data || { message: 'Erreur lors de la création de la section' };
  }
};

// Update an existing section
export const updateSection = async (id, sectionData) => {
  try {
    const response = await api.put(`/sections/${id}`, sectionData);
    return response.data;
  } catch (error) {
    console.error('Error updating section:', error);
    throw error.response?.data || { message: 'Erreur lors de la mise à jour de la section' };
  }
};

// Delete a section
export const deleteSection = async (id) => {
  try {
    const response = await api.delete(`/sections/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error.response?.data || { message: 'Erreur lors de la suppression de la section' };
  }
};

// Assign responsable to a section
export const assignResponsableToSection = async (id, responsableId) => {
  try {
    const response = await api.post(`/sections/${id}/responsable`, { responsable_id: responsableId });
    return response.data;
  } catch (error) {
    console.error('Error assigning responsable:', error);
    throw error.response?.data || { message: 'Erreur lors de l\'attribution du responsable' };
  }
};

// Get sections by responsable
export const getSectionsByResponsable = async (responsableId) => {
  try {
    const response = await api.get(`/sections/responsable/${responsableId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sections by responsable:', error);
    throw error.response?.data || { message: 'Erreur lors de la récupération des sections' };
  }
};