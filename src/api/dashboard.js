import api from './index';

export const getDashboardStatistics = async () => {
  try {
    const response = await api.get('/dashboard/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques' };
  }
};

export const getUrgentInterventions = async () => {
  try {
    const response = await api.get('/dashboard/urgent-interventions');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des interventions urgentes' };
  }
};

export const getUpcomingMaintenance = async () => {
  try {
    const response = await api.get('/dashboard/upcoming-maintenance');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des maintenances à venir' };
  }
};

export const getRecentActivities = async () => {
  try {
    const response = await api.get('/dashboard/recent-activities');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des activités récentes' };
  }
};
