import api from '../../api/axiosClient';

export const EmpAttendanceService = {
  getMyAttendance: async (search: string = "") => {
    const response  = await api.get(`/attendance/my-attendance`, {
      params: { search }
    });
    return response.data;
  },

  requestOverTime: async(id: number, otStatus?: string, otRemarks?: string) => {
    const response = await api.patch(`/attendance/request-overtime/${id}`, {
      otStatus, 
      otRemarks 
    });
    return response.data;
  }

};