import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmpLeaveService } from '../../services/employee/empLeave.service';

export const useEmpLeavesQuery = (search: string = "") => {
  return useQuery({
    queryKey: ['empLeaves', search],
    queryFn: () => EmpLeaveService.getMyLeaves(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });
}

export const useApplyLeaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startDate, endDate, type, reason, isHalfDay }: { startDate: string; endDate: string; type: string; reason: string; isHalfDay: boolean }) =>
      EmpLeaveService.applyLeave(startDate, endDate, type, reason, isHalfDay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empLeaves'] });
    }
  });
};