import api from './api';

const driverService = {
  getAll: async () => {
    const response = await api.get('/drivers');
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/drivers/available');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/drivers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/drivers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },

  register: async (data) => {
    try {
      const response = await api.post('/auth/register', {
        username: data.username,
        password: data.password,
        email: data.email,
        role: 'DRIVER'
      });

      if (response.data && response.data.id) {
        const driverData = {
          user: { id: response.data.id },
          licenseNumber: data.licenseNumber,
          status: 'AVAILABLE'
        };
        const driverResponse = await api.post('/drivers', driverData);
        return driverResponse.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error registering driver:', error);
      throw error;
    }
  },

  getMyVehicle: async () => {
    const response = await api.get('/drivers/me/vehicle');
    return response.data;
  },
};

export default driverService;