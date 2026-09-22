import api from './api';

const formatDate = (date) => {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const analyticsService = {
  compare: async (rangeA, rangeB) => {
    const params = {};
    if (rangeA?.start) params.rangeAStart = formatDate(rangeA.start);
    if (rangeA?.end) params.rangeAEnd = formatDate(rangeA.end);
    if (rangeB?.start) params.rangeBStart = formatDate(rangeB.start);
    if (rangeB?.end) params.rangeBEnd = formatDate(rangeB.end);

    const response = await api.get('/analytics/compare', { params });
    return response.data;
  },
};

export default analyticsService;
