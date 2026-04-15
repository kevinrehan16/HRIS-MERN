import api from '../api/axiosClient';

export const AttendanceService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/attendance/admin-logs`, {
      params: { search }
    });
    return response.data;
  },

  getAllOvertimeRequests: async (search: string = "") => {
    const response = await api.get(`/attendance/pending-ot`, {
      params: { search }
    });
    return response.data;
  },

  updateOvertimeStatus: async (payload: { attendanceId: number, status: string, remarks?: string }) => {
    const response = await api.patch('/attendance/approve-ot', payload); 
    return response.data;
  }

};