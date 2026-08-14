import api from '../api/axiosClient';

export const DashboardService = {
  getAdmin: async () => (await api.get('/dashboard/admin')).data.data,
  getEmployee: async () => (await api.get('/dashboard/me')).data.data,
};