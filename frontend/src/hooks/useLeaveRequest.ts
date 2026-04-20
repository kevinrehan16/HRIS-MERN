import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveRequestService } from '../services/leaverequest.service';

export const useLeaveRequest = (search: string = "") => {
  const queryClient = useQueryClient();

  const leaveRequestQuery = useQuery({
    queryKey: ['leave-requests', search],
    queryFn: () => LeaveRequestService.getAll(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  const approveLeaveMutation = useMutation({
    mutationFn: ({ id, adminRemarks }: { id: number; adminRemarks?: string }) => 
      LeaveRequestService.approveLeave(id, adminRemarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    }
  });

  const rejectLeaveMutation = useMutation({
      mutationFn: ({ id, adminRemarks }: { id: number; adminRemarks?: string }) => 
        LeaveRequestService.rejectLeave(id, adminRemarks),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      }
    });

  return { 
    leaveRequestQuery,
    approveLeaveMutation,
    rejectLeaveMutation
  };
};