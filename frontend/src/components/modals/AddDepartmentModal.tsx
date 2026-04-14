import React from 'react'
import { AlertCircle, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useDepartments } from '../../hooks/useDepartments';


const AddDepartmentModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { createMutation } = useDepartments();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
      defaultValues: {
        name: "",
        description: ""
      }
    });

  const onSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg">Add New Department</h3>
            <p className="text-sm text-slate-200 font-medium">Register a new department to the system.</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Department Name</label>
            <input 
              {...register("name", { required: "Department Name is required" })}
              className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.name && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Description</label>
            <input 
              {...register("description", { required: "Description is required" })}
              className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.description ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.description && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.description.message}</span>}
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
              <Save /> Save Department
              {/* {createMutation.isPending ? "Saving..." : "Save Position"} */}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDepartmentModal
