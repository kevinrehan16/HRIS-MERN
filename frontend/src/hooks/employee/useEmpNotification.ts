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

// export const useApplyLeaveMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ startDate, endDate, type, reason, isHalfDay }: { startDate: string; endDate: string; type: string; reason: string; isHalfDay: boolean }) =>
//       EmpLeaveService.applyLeave(startDate, endDate, type, reason, isHalfDay),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['empLeaves'] });
//     }
//   });
// };