import api from './api';

const userService = {
  getTechnicians: async () => {
    const response = await api.get('/users/technicians');
    return response.data;
  },
};

export default userService;