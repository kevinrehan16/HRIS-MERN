import api from '../../api/axiosClient';

export const EmpLeaveService = {

  getMyLeaves: async (search: string = "") => {
    const response = await api.get('/leave-request/my-leaves', {
      params: { search }
    });
    return response.data;
  },

  applyLeave: async (startDate: string, endDate: string, type: string, reason: string, isHalfDay: boolean) => {
    const response = await api.post('/leave-request/apply', {
      startDate,
      endDate,
      type,
      reason,
      isHalfDay
    });
    return response.data;
  }
};