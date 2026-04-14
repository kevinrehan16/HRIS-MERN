import { useForm } from "react-hook-form";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import { usePositions } from "../../hooks/usePositions"; 
import { useLookups } from "../../hooks/useLookups"; // Calling POSITIOSN and DEPARTMENTS

const AddPositionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { createMutation } = usePositions();
  const { departments } = useLookups(); // Para sa dropdown

  
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      departmentId: "",
      minSalary: 0,
      maxSalary: 0
    }
  });

  const minSalary = watch("minSalary");
  const maxSalary = watch("maxSalary");

  const onSubmit = (data: any) => {
    createMutation.mutate({
      ...data,
      departmentId: parseInt(data.departmentId),
      minSalary: parseFloat(data.minSalary),
      maxSalary: parseFloat(data.maxSalary)
    }, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg">Add New Position</h3>
            <p className="text-sm text-slate-200 font-medium">Register a new position to the system.</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* TITLE */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Position Title</label>
            <input 
              {...register("title", { required: "Position Title is required" })}
              className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.title ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.title && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.title.message}</span>}
          </div>

          {/* DEPARTMENT SELECT */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Assign Department</label>
            <select 
              {...register("departmentId", { required: "Please select a department" })}
              className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.departmentId ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
            >
              <option value="">Select Department...</option>
              {departments?.map((dept: any) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.departmentId && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.departmentId.message}</span>}
          </div>

          {/* SALARY RANGE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1 text-emerald-600">Min Salary (PHP)</label>
              <input 
                type="number"
                {...register("minSalary", { required: "Min salary is required", min: 0 })}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.minSalary ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none`}
              />
              {errors.minSalary && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.minSalary.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1 text-blue-600">Max Salary (PHP)</label>
              <input 
                type="number"
                {...register("maxSalary", { 
                  required: "Max salary is required",
                  valueAsNumber: true,
                  validate: (value) => value >= minSalary || "Max salary must be greater than Min salary"
                })}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.maxSalary ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              />
              {errors.maxSalary && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.maxSalary.message}</span>}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Description</label>
            <textarea 
              {...register("description")}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Briefly describe the responsibilities..."
            />
          </div>

          {/* BUTTONS */}
          <div className="py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-medium rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-1"
            >
              <X /> Cancel
            </button>
            <button 
              type="submit"
              // disabled={createMutation.isPending}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-1"
            >
              <Save /> Save Position
              {/* {createMutation.isPending ? "Saving..." : "Save Position"} */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPositionModal;