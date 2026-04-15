import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttendanceService } from '../services/attendance.service';

export const useAttendance = (search: string = "") => {
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['attendance', search],
    queryFn: () => AttendanceService.getAll(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    // --- DAGDAG MO ITO ---
    select: (response) => {
      // Kung ang response ay may 'data' field (paginated), kunin yung data.
      // Kung wala, asahan na array na siya agad.
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  const overtimeRequestsQuery = useQuery({
    queryKey: ['overtime-requests', search],
    queryFn: () => AttendanceService.getAllOvertimeRequests(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  const updateOvertimeStatusMutation = useMutation({
    mutationFn: (variables: { attendanceId: number; status: string; remarks?: string }) => 
      AttendanceService.updateOvertimeStatus(variables), // Siguraduhin na naipapasa ang variables dito
    onSuccess: () => {
      // I-refresh ang table para mawala na yung request
      queryClient.invalidateQueries({ queryKey: ['overtime-requests'] });
    }
  });

  return { 
    attendanceQuery,
    overtimeRequestsQuery,
    updateOvertimeStatusMutation
  };
};