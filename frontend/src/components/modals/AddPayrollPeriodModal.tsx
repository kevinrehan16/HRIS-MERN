import { useForm } from "react-hook-form";
import { X, Save, AlertCircle, Calendar, Tag } from "lucide-react";
import { useAddPayrollPeriodMutation } from "../../hooks/usePayrollPeriod";

interface AddPayrollPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPayrollPeriodModal = ({ isOpen, onClose }: AddPayrollPeriodModalProps) => {
  const addPayrollPeriodMutation = useAddPayrollPeriodMutation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      periodName: "",
      startDate: "",
      endDate: "",
      payoutDate: "",
      payrollType: "REGULAR"
    }
  });

  const onSubmit = (data: any) => {
    addPayrollPeriodMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
        console.log("Payroll period created successfully");
      },
      onError: (error: any) => {
        console.error("Error creating payroll period:", error);
      }
    });

    console.log("Submitting Period:", data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER - Kinopya ang blue-indigo gradient mo */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg text-white">Create Payroll Period</h3>
            <p className="text-sm text-slate-200 font-medium">Set up a new cut-off batch for computation.</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* PERIOD NAME */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Period Name</label>
            <div className="relative">
              <input 
                {...register("periodName", { required: "Period Name is required" })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.periodName ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
                placeholder="e.g. June 16-30, 2026 Cut-off"
              />
              <Tag className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
            {errors.periodName && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.periodName.message}</span>}
          </div>

          {/* DATES GRID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 text-emerald-600">Start Date</label>
              <input 
                type="date"
                {...register("startDate", { required: "Start date is required" })}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.startDate ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none`}
              />
              {errors.startDate && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.startDate.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 text-blue-600">End Date</label>
              <input 
                type="date"
                {...register("endDate", { required: "End date is required" })}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.endDate ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              />
              {errors.endDate && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.endDate.message}</span>}
            </div>
          </div>

          {/* PAYOUT DATE & TYPE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 text-indigo-600">Payout Date (Sueldo)</label>
              <div className="relative">
                <input 
                  type="date"
                  {...register("payoutDate", { required: "Payout date is required" })}
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.payoutDate ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none`}
                />
              </div>
              {errors.payoutDate && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.payoutDate.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payroll Type</label>
              <select 
                {...register("payrollType")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="REGULAR">Regular</option>
                <option value="13TH_MONTH">13th Month</option>
                <option value="BONUS">Bonus</option>
              </select>
            </div>
          </div>

          {/* INFO BOX - Para sa user guidance */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
            <Calendar className="text-blue-500 shrink-0" size={18} />
            <p className="text-[11px] text-blue-700 leading-relaxed m-0">
              <strong>Pro Tip:</strong> Setting a batch here will allow you to compute salaries for all employees within this date range later.
            </p>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 !rounded-md transition-all flex items-center gap-2 text-sm"
            >
              <X size={18} /> Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium !rounded-md shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 text-sm"
            >
              <Save size={18}/> Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPayrollPeriodModal;