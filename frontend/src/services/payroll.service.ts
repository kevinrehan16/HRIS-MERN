import api from '../api/axiosClient';

export const PayrollService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/payroll`, {
      params: { search }
    });
    return response.data;
  },

  generate: async (payrollPeriodId: number) => {
    const response = await api.post('/payroll/generate', {
      payrollPeriodId
    });
    return response.data;
  }
  
};