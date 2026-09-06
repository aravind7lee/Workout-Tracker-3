import api from '../utils/api';

export const bodyMetricsService = {
  async create(payload) {
    const { data } = await api.post('/body-metrics', payload);
    if (data.achievements?.length) window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: data.achievements }));
    return data.metric;
  },
  async latest() {
    const { data } = await api.get('/body-metrics/latest');
    return data.metric;
  },
  async chart(days = '90') {
    const { data } = await api.get('/body-metrics/chart', { params: { days } });
    return data.data || [];
  },
  async list(page = 1, limit = 20) {
    const { data } = await api.get('/body-metrics', { params: { page, limit } });
    return data;
  },
  async remove(id) {
    return (await api.delete(`/body-metrics/${id}`)).data;
  }
};

export default bodyMetricsService;
