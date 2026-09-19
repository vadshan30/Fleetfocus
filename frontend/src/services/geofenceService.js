import api from './api';

const geofenceService = {
  getAll: async () => {
    const response = await api.get('/geofences');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/geofences/active');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/geofences/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/geofences', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/geofences/${id}`, data);
    return response.data;
  },

  deactivate: async (id) => {
    const response = await api.delete(`/geofences/${id}`);
    return response.data;
  },
};

export default geofenceService;