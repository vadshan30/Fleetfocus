import api from './api';

const maintenanceService = {
  getAll: async () => {
    const response = await api.get('/maintenance');
    return response.data;
  },

  log: async (data) => {
    const response = await api.post('/maintenance/log', data);
    return response.data;
  },
};

export default maintenanceService;