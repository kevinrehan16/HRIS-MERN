import api from '../api/axiosClient';

export const PositionService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/positions`, {
      params: { search }
    });
    return response.data;
  },

  create: async (payload: { title: string; description?: string }) => {
    const response = await api.post(`/positions`, payload);
    return response.data;
  },

  update: async (id: number, payload: { title: string; description?: string }) => {
    const response = await api.put(`/positions/${id}`, payload);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/positions/${id}`);
    return response.data;
  }
};