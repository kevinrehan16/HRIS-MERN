import api from '../../api/axiosClient';

export const EmpAttendanceService = {
  getMyAttendance: async (search: string = "") => {
    const response  = await api.get(`/attendance/my-attendance`, {
      params: { search }
    });
    return response.data;
  },

};