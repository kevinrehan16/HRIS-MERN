import api from "../../api/axiosClient"
import type { AttendanceCorrectionPayload } from "../../types/attendance";


export const EmpCorrectionService = {
  // getAll: async (search: string = "") => {
  //   const response  = await api.get(`/attendance-correction/corrections`, {
  //     params: { search }
  //   });
  //   return response.data;
  // },

  requestCorrection: async (payload: AttendanceCorrectionPayload) => {
    const response = await api.post(`/attendance-correction/corrections`, payload);
    return response.data;
  },

  // rejectCorrection: async (id: number, adminRemarks?: string) => {
  //   const response = await api.patch(`/attendance-correction/corrections/${id}/reject`, { adminRemarks });
  //   return response.data;
  // }

};