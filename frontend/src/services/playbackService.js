import api from './api';

export const normalizeIso = (s) => {
  if (!s) return s;
  return s.length > 19 ? s.slice(0, 19) : s;
};

export const parseSafeDate = (str) => {
  if (!str) return null;
  if (str instanceof Date) return str;
  return new Date(normalizeIso(str));
};

const playbackService = {
  getTimeRange: async () => {
    const response = await api.get('/playback/range');
    return response.data;
  },

  getFrameAt: async (isoTime) => {
    const response = await api.get('/playback/frame', {
      params: { time: isoTime },
    });
    return response.data;
  },

  getTimeline: async (startIso, endIso, intervalSeconds = 60) => {
    const response = await api.get('/playback/timeline', {
      params: {
        start: startIso,
        end: endIso,
        interval: intervalSeconds,
      },
    });
    return response.data;
  },
};

export default playbackService;
