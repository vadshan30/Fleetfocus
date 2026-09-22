import api from './api';

const tripService = {
  getAll: async () => {
    const response = await api.get('/trips');
    return response.data;
  },

  getMyTrips: async () => {
    const response = await api.get('/trips/mine');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  getEta: async (id) => {
    const response = await api.get(`/trips/${id}/eta`);
    return response.data;
  },

  start: async (data) => {
    const response = await api.post('/trips/start', data);
    return response.data;
  },

  end: async (id, distance) => {
    const response = await api.put(`/trips/${id}/end`, { distance });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/trips/${id}/cancel`);
    return response.data;
  },

  schedule: async (data) => {
    const response = await api.post('/trips/schedule', data);
    return response.data;
  },

  getByDriver: async (driverId) => {
    const response = await api.get(`/trips/driver/${driverId}`);
    return response.data;
  },

  getByVehicle: async (vehicleId) => {
    const response = await api.get(`/trips/vehicle/${vehicleId}`);
    return response.data;
  },

  startByDriver: async (tripId) => {
    const response = await api.post(`/trips/${tripId}/start-by-driver`);
    return response.data;
  },

  endByDriver: async (tripId, distanceKm) => {
    const response = await api.post(`/trips/${tripId}/end-by-driver`, { distanceKm });
    return response.data;
  },

  reportIssue: async (tripId, issueData) => {
    const response = await api.post(`/trips/${tripId}/report-issue`, issueData);
    return response.data;
  },
};

export default tripService;