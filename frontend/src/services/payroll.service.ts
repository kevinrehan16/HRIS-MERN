import api from '../api/axiosClient';

export const PayrollService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/payroll`, {
      params: { search }
    });
    return response.data;
  },
  
};