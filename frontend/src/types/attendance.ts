export interface AttendanceCorrectionPayload {
  attendanceId: number;
  employeeId: number;
  type: 'TIME_IN' | 'TIME_OUT' | 'BOTH';
  requestedTimeIn: string | null;
  requestedTimeOut: string | null;
  reason: string;
}