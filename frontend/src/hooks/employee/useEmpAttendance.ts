import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmpAttendanceService } from '../../services/employee/empAttendance.service';

export const useEmpAttendance = (search: string = "") => {
  const queryClient = useQueryClient();

  const myAttendanceQuery = useQuery({
    queryKey: ['attendance', search],
    queryFn: () => EmpAttendanceService.getMyAttendance(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    // --- DAGDAG MO ITO ---
    select: (response) => {
      // Kung ang response ay may 'data' field (paginated), kunin yung data.
      // Kung wala, asahan na array na siya agad.
      return Array.isArray(response) ? response : response.data || [];
    }
  });


  return { 
    myAttendanceQuery,
  };
};