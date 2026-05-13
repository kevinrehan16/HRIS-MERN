import React, { useState } from 'react';
import { X, Send, Info, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from "react-hook-form";

import { useApplyLeaveMutation } from '../../hooks/employee/useEmpLeave';
import { notificationService } from '../../utils/notifications';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplyLeaveModal = ({ isOpen, onClose }: ApplyLeaveModalProps) => {
  const applyLeaveMutation = useApplyLeaveMutation();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      type: '',
      reason: '',
      isHalfDay: false
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setLoading(true);
    await applyLeaveMutation.mutateAsync(data, {
      onSuccess: () => {
        notificationService.toast("Leave request submitted successfully.");
        reset();
        onClose();
      },
      onError: (error) => {
        console.error("Error applying for leave:", error);
      }
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg text-white">Create Leave</h3>
            <p className="text-sm text-slate-100 font-medium font-inter">Submit a new leave request.</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form id="leave-form" onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          
          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              id="halfday"
              {...register("isHalfDay")}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="halfday" className="text-[16px] font-medium text-slate-600">
              Morning Half Day? (0.5 day)
            </label>
          </div>
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Start Date</label>
              <input 
                type="date" 
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                {...register("startDate", { required: "Please select a start date." })}
              />
              {errors.startDate && <span className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.startDate.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">End Date</label>
              <input 
                type="date" 
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                {...register("endDate", { required: "Please select an end date." })}
              />
              {errors.endDate && <span className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.endDate.message}</span>}
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Leave Type</label>
            <select 
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer"
              {...register("type", { required: "Please select a leave type." })}
            >
              <option value="">-- Select Leave Type --</option>
              <option value="VACATION">Vacation Leave (VL)</option>
              <option value="SICK">Sick Leave (SL)</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
              <option value="EMERGENCY">Emergency Leave</option>
            </select>
            {errors.type && <span className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.type.message}</span>}
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Reason</label>
            <textarea 
              rows={3}
              placeholder="Brief explanation for leave..."
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none"
              {...register("reason", { required: "Please provide a reason for your leave." })}
            >
            </textarea>
            {errors.reason && <span className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.reason.message}</span>}
          </div>

          {/* Info Note */}
          <div className="flex gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Info size={14} className="text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-700 leading-tight m-0">
              Calculated days will be deducted from your available credits upon approval.
            </p>
          </div>

        </form>
        {/* Submit Button */}
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-2.5 font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 !rounded-md transition-all flex items-center gap-2 text-sm"
          >
            <X size={18} /> Cancel
          </button>
          <button 
            type="submit"
            form="leave-form"
            disabled={loading}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium !rounded-md shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Requesting...
              </>
            ) : (
              <><Send size={18} /> Submit</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;