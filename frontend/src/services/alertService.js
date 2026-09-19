import api from './api';

const alertService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size !== undefined) params.append('size', filters.size);
    if (filters.acknowledged !== undefined) params.append('acknowledged', filters.acknowledged);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.resolved !== undefined) params.append('resolved', filters.resolved);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/alerts?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  acknowledge: async (id) => {
    const response = await api.patch(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  resolve: async (id) => {
    const response = await api.patch(`/alerts/${id}/resolve`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/alerts/stats');
    return response.data;
  },
};

export default alertService;