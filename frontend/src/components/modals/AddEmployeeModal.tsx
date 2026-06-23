import { X, User, Briefcase, CreditCard, MapPin, Loader2, IdCard, Save, AlertCircle, Info } from 'lucide-react';
import { Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ENUMS } from '../../utils/constants';
import { calculateAge, formatShiftSchedule } from '../../utils/formatters';

import FaceEnrollment from '../common/FaceEnrollment';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import FormDatePicker from '../common/FormDatePicker';

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
  role:string;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  email: string;
  password: string;
  confirmPassword?: string;
  middleName: string;
  extensionName: string | null;
  gender: string;
  civilStatus: string;
  contactNo: string;
  emergencyName: string;
  emergencyContact: string;
  emergencyRelation: string;
  bankName: string;
  bankAccountNo: string;
  tinNo: string;
  sssNo: string;
  philhealthNo: string;
  pagibigNo: string;
  departmentId: string;
  positionId: string;
  status: string;
  employmentType: string;
  scheduleId: string;    
  basicSalary: number;   
  allowance: number;     
  leaveCredits: number;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, createMutation, updateMutation, onSuccessAction, initialData }) => {
  const [activeTab, setActiveTab] = useState('personal');
  // const { createEmployee } = useEmployees();
  const { departments, positions, schedules, isLoading: lookupsLoading } = useLookups();

  // REACT HOOK FORM
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch, 
    formState: { errors }
  } = useForm<EmployeeFormInput>();

  const password = watch("password");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Kapag may initialData, i-reset ang form gamit ang values nito
        reset({
          employeeId: initialData.employeeId,
          role: initialData.role,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          birthDate: initialData.birthDate,
          email: initialData.email,
          middleName: initialData.middleName,
          extensionName: initialData.extensionName,
          gender: initialData.gender,
          civilStatus: initialData.civilStatus,
          contactNo: initialData.contactNo,
          emergencyName: initialData.emergencyName,
          emergencyContact: initialData.emergencyContact,
          emergencyRelation: initialData.emergencyRelation,
          bankName: initialData.bankName,
          bankAccountNo: initialData.bankAccountNo,
          tinNo: initialData.tinNo,
          sssNo: initialData.sssNo,
          philhealthNo: initialData.philhealthNo,
          pagibigNo: initialData.pagibigNo,
          departmentId: initialData.departmentId,
          positionId: initialData.positionId,
          status: initialData.status,
          employmentType: initialData.employmentType,
          scheduleId: initialData.scheduleId,
          basicSalary: initialData.basicSalary,
          allowance: initialData.allowance,
          leaveCredits: initialData.leaveCredits,
        });
      } else {
        // Kapag "Add New", siguraduhing malinis ang form
        reset({
          employeeId: "",
          role: "EMPLOYEE",
          firstName: "",
          lastName: "",
          middleName: "",
          extensionName: null,
          birthDate: null, // Correct for DatePickers
          email: "",
          password: "",
          gender: "",
          civilStatus: "",
          contactNo: "",
          emergencyName: "",
          emergencyContact: "",
          emergencyRelation: "",
          bankName: "",
          bankAccountNo: "",
          tinNo: "",
          sssNo: "",
          philhealthNo: "",
          pagibigNo: "",
          // Para sa mga Select/Number fields:
          departmentId: "", 
          positionId: "",
          status: "",
          employmentType: "",
          scheduleId: "",
          basicSalary: 0,
          allowance: 0,
          leaveCredits: 15,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  // ON SUBMIT HANDLER
  const onSubmit = (data: EmployeeFormInput) => {
    const activeMutation = initialData ? updateMutation : createMutation;

    // 1. I-transform ang data para magtugma sa Database types (Int, Float, Decimal)
    const formattedPayload = {
      ...data,
      // I-convert ang mga string IDs pabalik sa Number (Int sa DB)
      departmentId: data.departmentId ? parseInt(data.departmentId) : null,
      positionId: data.positionId ? parseInt(data.positionId) : null,
      scheduleId: data.scheduleId ? parseInt(data.scheduleId) : null,
      
      // Siguraduhing Number ang financial/credit fields
      basicSalary: Number(data.basicSalary) || 0,
      allowance: Number(data.allowance) || 0,
      leaveCredits: Number(data.leaveCredits) || 0,

      // Kung Edit mode, isama ang ID para malaman ng backend kung anong row ang i-uupdate
      ...(initialData && { id: initialData.id })
    };

    // 2. I-execute ang mutation
    activeMutation.mutate(formattedPayload, {
      onSuccess: () => {
        notificationService.toast(
          initialData ? 'Employee updated successfully!' : 'Employee added successfully!'
        );
        onSuccessAction();
        onClose();
        reset();
      },
      onError: (err: any) => {
        // Mas maganda kung may specific error message galing sa server
        const errMsg = err?.response?.data?.message || "Failed to save employee";
        notificationService.toast(errMsg, 'error');
        console.error("Mutation Error:", err);
      }
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <User size={18} /> },
    { id: 'government', label: 'Government IDs', icon: <IdCard size={18} /> },
    { id: 'employment', label: 'Employment', icon: <Briefcase size={18} /> },
    { id: 'address', label: 'Address', icon: <MapPin size={18} /> },
    { id: 'bankaccount', label: 'Bank Accounts', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* FIXED DIMENSIONS: h-[750px] at max-w-6xl */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-full max-w-6xl h-[750px] max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* HEADER - Pinaganda ang contrast */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {initialData ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-0">
              {initialData ? 'Update the details of the selected employee.' : 'Register a new member to the system.'}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* MAIN FORM AREA - Fixed height container */}
        <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden bg-white">
          
          {/* LEFT SIDEBAR (TABS) - Fixed width, background subtle */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-2 space-y-2 hidden md:flex flex-col">
            <div className="my-4 px-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Form Sections</span>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 !rounded-md font-semibold text-sm transition-all ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <Alert variant="primary" className='mt-2'>
              <div className='flex gap-2'>
                {/* Pinaliit ko yung icon at tinanggal ko yung justify-between */}
                <Info className='text-blue-500' size={20}/> 
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                  Make sure all required fields marked with <span className='text-red-600 text-md'>*</span> are filled out correctly.
                </p>
              </div>
            </Alert>
          </div>

          {/* RIGHT SIDE (CONTENT) - Dito lang ang mag-scroll */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'personal' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h4 className="text-lg font-bold text-slate-800">Personal Information</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Step 1 of 5</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Employee ID"
                    reqField={true}
                    placeholder="EMP-2026-000"
                    error={errors.employeeId}
                    {...register("employeeId", { required: "ID is required" })}
                  />

                  <FormSelect 
                    label="Role"
                    options={ENUMS.ROLE} 
                    reqField={true}
                    error={errors.role}
                    {...register("role", { required: "Role is required" })} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="First Name"
                    reqField={true}
                    placeholder="John"
                    error={errors.firstName}
                    {...register("firstName", { required: "First name is required" })}
                  />

                  <FormInput
                    label="Last Name"
                    reqField={true}
                    placeholder="Doe"
                    error={errors.lastName}
                    {...register("lastName", { required: "Last name is required" })}
                  />

                  <FormInput
                    label="Middle Name"
                    placeholder="Smith"
                    reqField={false}
                    {...register("middleName")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormSelect 
                    label="Extension Name"
                    options={ENUMS.EXTENSION_NAME} 
                    error={errors.extensionName}
                    reqField={false}
                    {...register("extensionName")} 
                  />
                  
                  <FormDatePicker
                    label="Birth Date"
                    name="birthDate"
                    control={control}
                    reqField={true}
                    error={errors.birthDate}
                    {...register("birthDate", { required: "Birthday is required" })}
                    placeholder="Select birthday"
                    maxDate={new Date()}
                  />

                  <div className="space-y-1 flex flex-col">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">
                      Age
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={calculateAge(watch("birthDate")) ? `${calculateAge(watch("birthDate"))} years old` : "---"}
                      className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-[13px] font-normal text-slate-500 cursor-not-allowed outline-none"
                      placeholder="---"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormSelect 
                    label="Gender"
                    options={ENUMS.GENDER} 
                    reqField={false}
                    {...register("gender")} 
                  />

                  <FormSelect 
                    label="Civil Status"
                    options={ENUMS.CIVIL_STATUS} 
                    reqField={false}
                    error={errors.civilStatus}
                    {...register("civilStatus")} 
                  />

                  <FormInput
                    label="Contact Number"
                    placeholder="(+63) 000-000-0000"
                    error={errors.contactNo}
                    reqField={true}
                    {...register("contactNo", { required: "Contact number is required" })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Emergency Name"
                    placeholder="Enter full name"
                    error={errors.emergencyName}
                    reqField={false}
                    {...register("emergencyName")}
                  />

                  <FormInput
                    label="Emergency Contact"
                    placeholder="(+63) 000-000-0000"
                    error={errors.emergencyContact}
                    reqField={false}
                    {...register("emergencyContact")}
                  />

                  <FormInput
                    label="Emergency Relation"
                    placeholder="Relationship"
                    error={errors.emergencyRelation}
                    reqField={false}
                    {...register("emergencyRelation")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Email Address"
                    type="email"
                    reqField={true}
                    placeholder="john.doe@company.com"
                    error={errors.email}
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                    })}
                  />

                  {/* Password - Full Width */}
                  <FormInput
                    label="Initial Password"
                    type="password"
                    reqField={true}
                    placeholder="••••••••"
                    error={errors.password}
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                  />

                  {/* Password - Full Width */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">
                      Confirm Password <span className='!text-red-600 text-md'>*</span>
                    </label>
                    <input
                      type="password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) => value === password || "Passwords do not match"
                      })}
                      className={`w-full p-2 bg-slate-50 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-slate-200'
                      } rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all font-normal text-[11px]`}
                      placeholder="••••••••"
                    />
                    
                    {/* Error Message Display */}
                    {errors.confirmPassword && (
                      <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1 tracking-tight">
                        <AlertCircle size={12} /> {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {/* Face Enrollment - Sectioned */}
                  <div className="col-span-2 pt-4">
                    <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-3 text-center">Facial Recognition Setup</label>
                      <FaceEnrollment 
                        employeeId={initialData ? initialData.id : "temp-id"} 
                        onSuccess={() => notificationService.toast("Face data enrolled successfully!")} 
                      />
                    </div>
                  </div>
                </div>

                  
              </div>

            )}
            
            {/* GOVERNMENT INFORMATION TAB */}
            {activeTab === 'government' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-800">Government IDs</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-black uppercase tracking-wider">Step 2 of 5</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TIN Number */}
                  <FormInput
                    label="TIN Number"
                    type="text"
                    reqField={true}
                    placeholder="111-***-***-***"
                    error={errors.tinNo}
                    {...register("tinNo", { required: "TIN Number is required" })}
                  />

                  {/* TIN Number */}
                  <FormInput
                    label="SSS Number"
                    type="text"
                    reqField={true}
                    placeholder="111-***-***-***"
                    error={errors.sssNo}
                    {...register("sssNo", { required: "SSS Number is required" })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TIN Number */}
                  <FormInput
                    label="PhilHealth Number"
                    type="text"
                    reqField={true}
                    placeholder="111-***-***-***"
                    error={errors.philhealthNo}
                    {...register("philhealthNo", { required: "PhilHealth Number is required" })}
                  />

                  {/* TIN Number */}
                  <FormInput
                    label="Pag-ibig Number"
                    type="text"
                    reqField={true}
                    placeholder="111-***-***-***"
                    error={errors.pagibigNo}
                    {...register("pagibigNo", { required: "Pag-ibig Number is required" })}
                  />
                </div>

              </div>
            )}
            
            
            {/* EMPLOYMENT INFORMATION TAB */}
            {activeTab === 'employment' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-800">Employment Details</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-black uppercase tracking-wider">Step 3 of 5</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Department Dropdown */}
                  <FormSelect 
                    label="Department"
                    reqField={true}
                    error={errors.departmentId}
                    {...register("departmentId", { required: "Department is required" })}
                    options={departments.map((dept: any) => ({
                      label: dept.name,
                      value: dept.id // Siguraduhing string o number ang value
                    }))} 
                  />

                  {/* Position Dropdown */}
                  <FormSelect 
                    label="Position"
                    reqField={true}
                    error={errors.positionId}
                    {...register("positionId", { required: "Position is required" })}
                    options={positions.map((pos: any) => ({
                      label: pos.title,
                      value: pos.id // Siguraduhing string o number ang value
                    }))} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* EMPLOYMENT STATUS */}
                  <FormSelect 
                    label="Employment Status"
                    reqField={true}
                    options={ENUMS.EMPLOYMENT_STATUS} 
                    error={errors.status}
                    {...register("status", { required: "Employment Status is required" })} 
                  />

                  {/* EMPLOYMENT TYPE */}
                  <FormSelect 
                    label="Employment Type"
                    reqField={true}
                    options={ENUMS.EMPLOYMENT_TYPE} 
                    error={errors.employmentType}
                    {...register("employmentType", { required: "Employment Type is required" })} 
                  />

                  {/* SCHEDULE */}
                  <FormSelect 
                    label="Schedule"
                    reqField={true}
                    error={errors.scheduleId}
                    {...register("scheduleId", { required: "Schedule is required" })}
                    options={schedules.map((sched: any) => ({
                      label: sched.name + `: (${formatShiftSchedule(sched.shiftStart)} - ${formatShiftSchedule(sched.shiftEnd)})`,
                      value: sched.id // Siguraduhing string o number ang value
                    }))} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* BASIC SALARY */}
                  <FormInput
                    label="Basic Salary"
                    type="number"
                    reqField={true}
                    placeholder="0.00"
                    error={errors.basicSalary}
                    {...register("basicSalary", { required: "Basic Salary is required",
                      min: { value: 1, message: "Salary must be greater than 0" },
                      valueAsNumber: true
                     })}
                  />

                  {/* ALLOWANCE */}
                  <FormInput
                    label="Allowance"
                    type="number"
                    reqField={true}
                    placeholder="0.00"
                    error={errors.allowance}
                    {...register("allowance", { required: "Allowance is required",
                      min: { value: 1, message: "Allowance must be greater than 0" },
                      valueAsNumber: true
                     })}
                  />

                  {/* LEAVE CREDITS */}
                  <FormInput
                    label="Leave Credits"
                    type="number"
                    reqField={true}
                    placeholder="0.0"
                    error={errors.leaveCredits}
                    {...register("leaveCredits", { required: "Leave Credits is required" })}
                  />
                </div>


              </div>
            )}

            {/* EMPLOYMENT INFORMATION TAB */}
            {activeTab === 'bankaccount' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-800">Bank Account Details</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-black uppercase tracking-wider">Step 5 of 5</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Department Dropdown */}
                  <FormInput 
                    label="Bank Account Name"
                    placeholder="Bank name here..."
                    reqField={true}
                    {...register("bankName")} 
                  />

                  {/* Position Dropdown */}
                  <FormInput 
                    label="Bank Account Number"
                    placeholder="Bank number here..."
                    reqField={true}
                    {...register("bankAccountNo")} 
                  />
                </div>

              </div>
            )}

            {/* Other Tabs... */}
          </div>
        </form>

        {/* FOOTER - Fixed at the bottom */}
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
            form="employee-form"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium !rounded-md shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 text-sm"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <><Save size={18} /> Save Employee</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;