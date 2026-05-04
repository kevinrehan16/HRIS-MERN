import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmpCorrectionService } from "../../services/employee/empCorrection.service";
import type { AttendanceCorrectionPayload } from "../../types/attendance";

export const useEmpCorrection = () => {
  const queryClient = useQueryClient();

  const requestAttendanceCorrection = useMutation({
    // 1. Dito natin ilalagay ang saktong interface ng payload mo
    mutationFn: (payload: AttendanceCorrectionPayload) => 
      // 2. I-pasa ang buong payload object sa service
      EmpCorrectionService.requestCorrection(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: any) => {
      console.error("Correction Error:", error);
    }
  });

  return { 
    requestAttendanceCorrection,
    isPending: requestAttendanceCorrection.isPending,
  };
}