import axios from 'axios';

const api = {
  get: (url, config = {}) => axios.get(`http://localhost:8080/api${url}`, config),
  post: (url, data, config = {}) => axios.post(`http://localhost:8080/api${url}`, data, config),
  put: (url, data, config = {}) => axios.put(`http://localhost:8080/api${url}`, data, config),
  patch: (url, data, config = {}) => axios.patch(`http://localhost:8080/api${url}`, data, config),
  delete: (url, config = {}) => axios.delete(`http://localhost:8080/api${url}`, config),
};

const getToken = () => {
  try {
    const directToken = localStorage.getItem('token');
    if (directToken) {
      return directToken;
    }
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser && parsedUser.token) {
        return parsedUser.token;
      }
    }
  } catch (error) {
    // ignore
  }
  return null;
};

axios.interceptors.request.use(
  (config) => {
    try {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      } catch (e) {
        // ignore
      }
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;