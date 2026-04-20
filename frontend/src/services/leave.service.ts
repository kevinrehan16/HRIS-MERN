import api from '../api/axiosClient';

export const LeaveService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/leave`, {
      params: { search }
    });
    return response.data;
  },
  
};