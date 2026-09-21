import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
    }
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};

export default authService;