import api from '../api/axiosClient';

export const PayrollPeriodService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/payroll-periods`, {
      params: { search }
    });
    return response.data;
  },

  addPayrollPeriod: async (periodName: string, startDate: string, endDate: string, payoutDate: string) => {
    const response = await api.post('/payroll-periods', {
      periodName,
      startDate,
      endDate,
      payoutDate
    });
    return response.data;
  }

};