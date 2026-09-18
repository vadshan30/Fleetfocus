import api from './api';

const vehicleService = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get(`/vehicles?page=${page}&size=${size}`);
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/vehicles/available');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

export default vehicleService;