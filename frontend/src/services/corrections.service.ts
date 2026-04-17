import api from '../api/axiosClient';

export const CorrectionsService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/attendance-correction/corrections`, {
      params: { search }
    });
    return response.data;
  },

  approveCorrection: async (id: number, adminRemarks?: string) => {
    const response = await api.patch(`/attendance-correction/corrections/${id}/approve`, { adminRemarks });
    return response.data;
  },

  rejectCorrection: async (id: number, adminRemarks?: string) => {
    const response = await api.patch(`/attendance-correction/corrections/${id}/reject`, { adminRemarks });
    return response.data;
  }

};