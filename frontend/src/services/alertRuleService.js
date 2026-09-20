import api from './api';

const alertRuleService = {
  getAll: async () => {
    const response = await api.get('/alert-rules');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/alert-rules/active');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/alert-rules/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/alert-rules', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/alert-rules/${id}`, data);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await api.delete(`/alert-rules/${id}`);
    return response.data;
  },

  getEffectiveForVehicle: async (vehicleId) => {
    const response = await api.get(`/alert-rules/effective/${vehicleId}`);
    return response.data;
  },
};

export default alertRuleService;