import api from '../api/axiosClient';

export const DepartmentService = { 

  getAll: async (search: string = "") => {
    const response  = await api.get(`/departments`, {
      params: { search }
    });
    return response.data;
  },

  create: async (payload: { name: string; description?: string }) => {
    const response = await api.post(`/departments`, payload);
    return response.data;
  }

};