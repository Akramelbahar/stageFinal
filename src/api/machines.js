import api from './index';

export const getAllMachines = async () => {
  try {
    const response = await api.get('/machines');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des machines' };
  }
};

export const getMachinesRequiringMaintenance = async () => {
  try {
    const response = await api.get('/machines/maintenance/soon');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des machines nécessitant une maintenance' };
  }
};

export const getMachineById = async (id) => {
  try {
    const response = await api.get(`/machines/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération de la machine' };
  }
};

export const createMachine = async (machineData) => {
  try {
    const response = await api.post('/machines', machineData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la création de la machine' };
  }
};

export const updateMachine = async (id, machineData) => {
  try {
    const response = await api.put(`/machines/${id}`, machineData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la mise à jour de la machine' };
  }
};

export const updateMachineStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/machines/${id}/update-status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la mise à jour du statut de la machine' };
  }
};

export const deleteMachine = async (id) => {
  try {
    const response = await api.delete(`/machines/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la suppression de la machine' };
  }
};
