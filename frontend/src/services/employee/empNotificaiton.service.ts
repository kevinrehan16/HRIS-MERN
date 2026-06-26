import api from '../../api/axiosClient';

export const EmpNotificationService = {

  getMyNotifications: async (search: string = "") => {
    const response = await api.get('/notifications', {
      params: { search }
    });
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await api.patch('/notifications/'+id+"/read");
    return response.data;
  }
};