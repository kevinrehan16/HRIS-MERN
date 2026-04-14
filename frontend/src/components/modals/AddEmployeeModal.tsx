import { X, User, Briefcase, CreditCard, MapPin, Loader2, AlertCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { notificationService } from '../../utils/notifications';

import { useLookups } from '../../hooks/useLookups';
import { useEmployees } from '../../hooks/useEmployees';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  createMutation: any;
  updateMutation: any;
  onSuccessAction: () => void; // Idagdag itong prop
  initialData?: any;
}

// Interface para sa fields na tinatanggap ng backend mo ngayon
interface EmployeeFormInput {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  departmentId: string;
  positionId: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, createMutation, updateMutation, onSuccessAction, initialData }) => {
  const [activeTab, setActiveTab] = useState('personal');
  // const { createEmployee } = useEmployees();
  const { departments, positions, isLoading: lookupsLoading } = useLookups();

  // REACT HOOK FORM
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EmployeeFormInput>();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Kapag may initialData, i-reset ang form gamit ang values nito
        reset({
          employeeId: initialData.employeeId,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          email: initialData.email,
          // password: "", // Kadalasan, hindi ina-autofill ang password for security
          departmentId: initialData.departmentId,
          positionId: initialData.positionId,
        });
      } else {
        // Kapag "Add New", siguraduhing malinis ang form
        reset({
          employeeId: "",
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          departmentId: "",
          positionId: "",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  // ON SUBMIT HANDLER
  const onSubmit = (data: any) => {
    const activeMutation = initialData ? updateMutation : createMutation;
    const payload = initialData ? { ...data, id: initialData.id } : data;

    // console.log(createMutation.isPending);
    activeMutation.mutate(payload, {
      onSuccess: () => {
        notificationService.toast(initialData ? 'Updated successfully!' : 'Added successfully!');
        onSuccessAction();
        onClose();
        reset();
        
        // console.log("Employee added successfully!");
      },
      onError: (err: any) => {
        console.error("Failed to save:", err);
      }
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={18} /> },
    { id: 'employment', label: 'Employment', icon: <Briefcase size={18} /> },
    { id: 'address', label: 'Address', icon: <MapPin size={18} /> },
    { id: 'banking', label: 'Banking & Gov', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Employee' : 'Add New Employee'}</h3>
            <p className="text-sm text-slate-200 font-medium">{initialData ? 'Update the details of the selected employee.' : 'Register a new member to the system.'}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR (TABS) */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-2 hidden md:block">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* RIGHT SIDE (CONTENT) */}
          {/* PERSONAL INFORMATION TAB */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-800">Personal Information</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-black uppercase tracking-wider">Step 1 of 4</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Employee ID */}
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Employee ID</label>
                    <input 
                      {...register("employeeId", { required: "ID is required" })}
                      className={`w-full p-3 bg-slate-50 border ${errors.employeeId ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium`} 
                      placeholder="EMP-2026-000" 
                    />
                    {errors.employeeId && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.employeeId.message}</span>}
                  </div>

                  {/* Empty space or filler if needed */}
                  <div className="hidden md:block"></div>

                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                    <input 
                      {...register("firstName", { required: "First name is required" })}
                      className={`w-full p-3 bg-slate-50 border ${errors.firstName ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium`} 
                      placeholder="John" 
                    />
                    {errors.firstName && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.firstName.message}</span>}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input 
                      {...register("lastName", { required: "Last name is required" })}
                      className={`w-full p-3 bg-slate-50 border ${errors.lastName ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium`} 
                      placeholder="Doe" 
                    />
                    {errors.lastName && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.lastName.message}</span>}
                  </div>

                  {/* Email */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      {...register("email", { 
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                      })}
                      className={`w-full p-3 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium`} 
                      placeholder="john.doe@company.com" 
                    />
                    {errors.email && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.email.message}</span>}
                  </div>

                  {/* Password */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Initial Password</label>
                    <input 
                      type="password"
                      {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                      className={`w-full p-3 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium`} 
                      placeholder="••••••••" 
                    />
                    {errors.password && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.password.message}</span>}
                  </div>
                </div>
              </div>
            )}
            
            {/* EMPLOYMENT INFORMATION TAB */}
            {activeTab === 'employment' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-800">Employment Details</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-black uppercase tracking-wider">Step 2 of 4</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Department Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                    <select 
                      {...register("departmentId", { required: "Department is required" })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept: any) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Position Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Position</label>
                    <select 
                      {...register("positionId", { required: "Position is required" })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Position</option>
                      {positions.map((pos: any) => (
                        <option key={pos.id} value={pos.id}>{pos.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'address' && <div className="p-4 text-slate-400 italic">Address fields coming soon...</div>}
            {activeTab === 'banking' && <div className="p-4 text-slate-400 italic">Banking fields coming soon...</div>}
          </div>
        </form>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-2.5 font-medium text-slate-600 hover:bg-red-100 rounded-xl transition-all flex items-center gap-1"
          >
            <X size={18} /> Cancel
          </button>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-1"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving Employee...
              </>
            ) : (
              <><Save size={18} />Save Employee</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;