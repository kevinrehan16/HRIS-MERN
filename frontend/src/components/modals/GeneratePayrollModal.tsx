import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Play, AlertTriangle, Loader2, Info, CheckCircle2 } from "lucide-react";
import { usePayrollPeriodsQuery } from "../../hooks/usePayrollPeriod";
import { usePayroll } from "../../hooks/usePayroll";
import api from "../../api/axiosClient"

const GeneratePayrollModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { generatePayrollMutation } = usePayroll();
  const { data: payrollPeriods } = usePayrollPeriodsQuery();

  // --- NEW STATES FOR PROGRESS ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      payrollPeriodId: ""
    }
  });

  const selectedPeriodId = watch("payrollPeriodId");

  // --- POLLING LOGIC ---
  const pollProgress = async (id: string) => {
    try {
      // Palitan mo 'to ng tamang endpoint mo para makuha ang single payroll period
      const res = await api.get(`/payroll-periods/${id}`);
      const { progress: currentProgress, status } = res.data.data;

      setProgress(currentProgress);

      if (status === "PROCESSING" || currentProgress < 100) {
        setTimeout(() => pollProgress(id), 1000); // Poll every 1 second
      } else {
        // Tapos na!
        setTimeout(() => {
          setIsGenerating(false);
          reset();
          onClose();
        }, 1500); // Give user time to see 100%
      }
    } catch (error) {
      console.error("Polling error:", error);
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: any) => {
    setIsGenerating(true);
    setProgress(0);

    generatePayrollMutation.mutate({
      payrollPeriodId: parseInt(data.payrollPeriodId)
    }, {
      onSuccess: () => {
        // Kapag nasimulan na sa backend, simulan ang pag-poll
        pollProgress(data.payrollPeriodId);
      },
      onError: (error) => {
        console.log('Failed to generate payroll.', error);
        setIsGenerating(false);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg text-white">Run Payroll Generation</h3>
            <p className="text-sm text-slate-100 font-medium font-inter">Execute bulk salary computations.</p>
          </div>
          {!isGenerating && (
            <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors text-white">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6">
          {!isGenerating ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* WARNING BOX */}
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-4 items-start">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <AlertTriangle className="text-amber-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Review Required</h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                    This action will calculate attendance, deductions (SSS, PhilHealth), and taxes for all active employees. This may take a few moments.
                  </p>
                </div>
              </div>

              {/* PERIOD SELECTION */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Active Period</label>
                <select 
                  {...register("payrollPeriodId", { required: "Please select a period to process" })}
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.payrollPeriodId ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer`}
                >
                  <option value="">Choose a cutoff batch...</option>
                  {payrollPeriods?.map((period: any) => {
                    // I-define natin ang emoji base sa status
                    const statusEmoji = 
                      period.status === 'COMPLETED' ? '🔒' : 
                      period.status === 'PROCESSING' ? '⏳' : '🔓';

                    // I-define ang label (hal: 🔒 Monthly Cutoff - Jan)
                    const label = `${statusEmoji} ${period.periodName} ${period.status === 'COMPLETED' ? '(Locked)' : ''}`;

                    return (
                      <option 
                        key={period.id} 
                        value={period.id} 
                        // I-disable para hindi ma-click kung tapos na o kasalukuyang ginagawa
                        disabled={period.status === 'COMPLETED' || period.status === 'PROCESSING'}
                        className={period.status === 'COMPLETED' ? 'text-slate-400' : ''}
                      >
                        {label}
                      </option>
                    );
                  })}
                </select>
                {errors.payrollPeriodId && (
                  <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 uppercase tracking-tighter">
                    <Info size={12}/> {errors.payrollPeriodId.message}
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-3">
                <button 
                  type="submit"
                  className="w-full px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium !rounded-md shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                >
                  <Play size={18} fill="currentColor" />
                  Start Generation
                </button>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="w-full px-6 py-2.5 font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 !rounded-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <X size={18} fill="currentColor" /> Cancel Process
                </button>
              </div>
            </form>
          ) : (
            /* --- PROGRESS BAR UI --- */
            <div className="py-8 text-center space-y-6 animate-in fade-in duration-500">
              <div className="relative w-24 h-24 mx-auto">
                {/* Circular Loader background */}
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                {/* Circular Loader progress */}
                <div 
                  className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"
                  style={{ animationDuration: '2s' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-slate-700">{progress}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800">Processing Payroll...</h4>
                <p className="text-xs text-slate-500">Calculating mathematics and government deductions.</p>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {progress === 100 && (
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold animate-bounce">
                  <CheckCircle2 size={20} />
                  <span>Computation Complete!</span>
                </div>
              )}
              
              <p className="text-[10px] text-slate-400 italic">Please do not close or refresh this window.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePayrollModal;