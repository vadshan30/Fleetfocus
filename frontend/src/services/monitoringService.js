import api from './api';

const monitoringService = {
  getLiveFleet: async () => {
    const response = await api.get('/monitoring/live');
    return response.data;
  },
};

export default monitoringService;