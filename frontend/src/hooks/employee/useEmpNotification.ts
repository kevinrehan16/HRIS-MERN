import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmpNotificationService } from '../../services/employee/empNotificaiton.service';

export const useEmpNotificationQuery = (search: string = "") => {
  return useQuery({
    queryKey: ['my-notification', search],
    queryFn: () => EmpNotificationService.getMyNotifications(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });
}

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id ) => EmpNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notification'] });
    },
    onError: (error) => {
      console.error("Error marking as read:", error);
    }
  });
};