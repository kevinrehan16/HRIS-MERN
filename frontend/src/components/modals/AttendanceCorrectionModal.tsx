import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useForm } from 'react-hook-form';

import { notificationService } from '../../utils/notifications';
import type { AttendanceCorrectionPayload } from '../../types/attendance';
import { useEmpCorrection } from '../../hooks/employee/useEmpCorrection';
import { X, Send, Loader2 } from 'lucide-react';

interface Props {
  record: any; 
  isOpen: boolean;
  onClose: () => void;
}

dayjs.extend(utc);

const AttendanceCorrectionModal = ({ record, isOpen, onClose }: Props) => {
  // 1. Tawagin ang mutation hook
  const { requestAttendanceCorrection, isPending } = useEmpCorrection();

  // 2. Initialize React Hook Form
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AttendanceCorrectionPayload>({
    defaultValues: {
      type: 'TIME_IN',
      attendanceId: record?.id,
      employeeId: record?.employeeId,
      reason: '',
      // I-format ang date para sa datetime-local input (YYYY-MM-DDTHH:mm)
      requestedTimeIn: record?.timeIn ? dayjs.utc(record.timeIn).format('YYYY-MM-DDTHH:mm') : '',
      requestedTimeOut: record?.timeOut ? dayjs.utc(record.timeOut).format('YYYY-MM-DDTHH:mm') : '',
    }
  });

  // I-watch ang type para sa dynamic UI
  const selectedType = watch('type');

  // 3. Submit Handler
  const onSubmit = (data: AttendanceCorrectionPayload) => {
    try {
      const finalPayload: AttendanceCorrectionPayload = {
        ...data,
        attendanceId: record.id,
        employeeId: record.employeeId,
        // Gagamit tayo ng .format() na may 'T' at '.000Z' para magmukhang UTC
        // Pero hindi natin gagamitin ang .utc() function para hindi mag-move ang oras
        requestedTimeIn: (data.type === 'TIME_IN' || data.type === 'BOTH') 
          ? dayjs(data.requestedTimeIn).format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' : null,
        requestedTimeOut: (data.type === 'TIME_OUT' || data.type === 'BOTH') 
          ? dayjs(data.requestedTimeOut).format('YYYY-MM-DDTHH:mm:ss.000') + 'Z' : null,
      };

      console.log("Payload being sent:", finalPayload);

      requestAttendanceCorrection.mutate(finalPayload, {
        onSuccess: () => {
          notificationService.toast('Your attendance correction request has been submitted successfully and is now pending for approval.');
          reset();
          onClose();
        }
      });
    } catch (error) {
      notificationService.toast('Error: ' + error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg">Request Attendance Correction</h3>
            <p className="text-sm text-slate-200 font-medium">Request adjustments for your time logs to ensure accurate attendance records.</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form id="correction-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* Correction Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Correction Type</label>
            <select 
              {...register('type')}
              className="w-full px-3 py-2 border-2 border-slate-100 rounded-lg text-sm font-bold focus:border-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="TIME_IN">TIME IN ONLY</option>
              <option value="TIME_OUT">TIME OUT ONLY</option>
              <option value="BOTH">BOTH (IN & OUT)</option>
            </select>
          </div>

          <div className="space-y-4">
            {/* TIME IN SECTION */}
            {(selectedType === 'TIME_IN' || selectedType === 'BOTH') && (
              <div className="grid grid-cols-2 gap-4 items-end animate-in fade-in slide-in-from-top-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Time In</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-md text-slate-500 font-semibold">
                    {record?.timeIn ? dayjs.utc(record.timeIn).format('hh:mm A') : '--:--'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Requested Time In</label>
                  <input 
                    type="datetime-local"
                    {...register('requestedTimeIn')}
                    className="w-full px-3 py-2 border-2 border-blue-50 rounded-lg text-sm font-medium focus:border-blue-500 outline-none uppercase"
                  />
                </div>
              </div>
            )}

            {/* TIME OUT SECTION */}
            {(selectedType === 'TIME_OUT' || selectedType === 'BOTH') && (
              <div className="grid grid-cols-2 gap-4 items-end animate-in fade-in slide-in-from-top-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Time Out</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-md text-slate-500 font-semibold">
                    {record?.timeOut ? dayjs.utc(record.timeOut).format('hh:mm A') : '--:--'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Requested Time Out</label>
                  <input 
                    type="datetime-local"
                    {...register('requestedTimeOut')}
                    className="w-full px-3 py-2 border-2 border-blue-50 rounded-lg text-sm font-medium focus:border-blue-500 outline-none uppercase"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1">
              Reason for Correction
            </label>
            <textarea 
              {...register('reason', { required: "Reason is required" })}
              rows={3}
              placeholder="Explain the correction..."
              className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:border-blue-500 outline-none resize-none transition-all ${errors.reason ? 'border-red-200 bg-red-50' : 'border-slate-100'}`}
            />
            {errors.reason && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.reason.message}</p>}
          </div>
        </form>

          {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 !rounded-md transition-all flex items-center gap-2 text-sm"
          >
            <X size={15} /> Cancel
          </button>
          <button 
            type="submit"
            form="correction-form"
            disabled={isPending}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium !rounded-md shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 text-sm"
          >
            {isPending ?<><Loader2 size={15} /> Submitting...</> : <><Send size={15} /> Submit Request</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCorrectionModal
