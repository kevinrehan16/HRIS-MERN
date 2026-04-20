import api from '../api/axiosClient';

export const LeaveRequestService = {
  getAll: async (search: string = "") => {
    const response  = await api.get(`/leave-request/all-requests`, {
      params: { search }
    });
    return response.data;
  },

  approveLeave: async (id: number, adminRemarks?: string) => {
    const response = await api.patch(`/leave-request/${id}/status`, { 
      status: 'APPROVED',
      adminRemarks
    });
    return response.data;
  },
  
  rejectLeave: async (id: number, adminRemarks?: string) => {
    const response = await api.patch(`/leave-request/${id}/status`, { 
      status: 'REJECTED',
      adminRemarks 
    });
    return response.data;
  }
  
};