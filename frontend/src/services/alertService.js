import api from './api';

const alertService = {
  getAlerts: async (filters = {}, page = 0, size = 25) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    if (filters.vehicleId && filters.vehicleId !== 'ALL') {
      params.append('vehicleId', filters.vehicleId);
    }
    if (filters.severity && filters.severity !== 'ALL') {
      params.append('severity', filters.severity);
    }
    if (filters.alertType && filters.alertType !== 'ALL') {
      params.append('alertType', filters.alertType);
    }
    if (filters.acknowledged !== undefined && filters.acknowledged !== 'ALL') {
      params.append('acknowledged', filters.acknowledged);
    }
    if (filters.resolved !== undefined && filters.resolved !== 'ALL') {
      params.append('resolved', filters.resolved);
    }
    if (filters.from) {
      params.append('from', filters.from);
    }
    if (filters.to) {
      params.append('to', filters.to);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const response = await api.get(`/alerts?${params.toString()}`);
    return response.data;
  },

  getAll: async (filters = {}) => {
    const page = filters.page !== undefined ? filters.page : 0;
    const size = filters.size !== undefined ? filters.size : 25;
    return alertService.getAlerts(filters, page, size);
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

  bulkAcknowledge: async (ids) => {
    const response = await api.post('/alerts/bulk-acknowledge', { ids });
    return response.data;
  },

  bulkResolve: async (ids) => {
    const response = await api.post('/alerts/bulk-resolve', { ids });
    return response.data;
  },

  purgeOld: async (olderThanDays = 30) => {
    const response = await api.delete(`/alerts/purge?olderThanDays=${olderThanDays}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/alerts/stats');
    return response.data;
  },
};

export default alertService;