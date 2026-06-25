import { X, User, Briefcase, CreditCard, MapPin, Loader2, IdCard, Save, AlertCircle, Info,
  FileText, UploadCloud, CheckCircle2, Eye, Trash2, ShieldCheck, FolderClosed
} from 'lucide-react';
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
import api from '../../api/axiosClient';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  createMutation: any;
  updateMutation: any;
  onSuccessAction: () => void;
  initialData?: any;
}

interface EmployeeFormInput {
  employeeId: string;
  role: string;
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
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  street?: string;
  zipCode?: string;
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  fileName: string | null;
  fileSize: string | null;
  status: 'PENDING' | 'UPLOADED';
  docType: string;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, createMutation, updateMutation, onSuccessAction, initialData }) => {
  const [documents, setDocuments] = useState<DocumentRequirement[]>([
    { 
      id: '1', 
      name: 'Resume / CV', 
      description: 'Latest updated professional resume', 
      required: true, 
      fileName: 'Rimer_Regalado_CV.pdf', 
      fileSize: '1.2 MB', 
      status: 'UPLOADED',
      docType: 'ECV'
    },
    { 
      id: '2', 
      name: 'NBI Clearance', 
      description: 'Must be issued within the last 6 months', 
      required: true, 
      fileName: null, 
      fileSize: null, 
      status: 'PENDING' ,
      docType: 'ENBI'
    },
    { id: '3', 
      name: 'PSA Birth Certificate', 
      description: 'Clear scanned copy of original PSA', 
      required: false, 
      fileName: null, 
      fileSize: null, 
      status: 'PENDING' ,
      docType: 'EPSA'
    },
    { id: '4', 
      name: 'TIN / SSS / ID Proof', 
      description: 'Any valid government-issued ID card', 
      required: true, 
      fileName: 'SSS_ID_Scanned.jpeg', 
      fileSize: '3.4 MB', 
      status: 'UPLOADED' ,
      docType: 'ETIN'
    },
  ]);

  const [activeTab, setActiveTab] = useState('personal');
  const { departments, positions, schedules, isLoading: lookupsLoading } = useLookups();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch, 
    formState: { errors }
  } = useForm<EmployeeFormInput>();

  const password = watch("password");
  const activeMutation = initialData ? updateMutation : createMutation;
  const isSubmitting = activeMutation?.isLoading || activeMutation?.isPending;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          employeeId: initialData.employeeId,
          role: initialData.role,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          birthDate: initialData.birthDate ? new Date(initialData.birthDate) : null,
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
          departmentId: initialData.departmentId?.toString() || "",
          positionId: initialData.positionId?.toString() || "",
          status: initialData.status,
          employmentType: initialData.employmentType,
          scheduleId: initialData.scheduleId?.toString() || "",
          basicSalary: initialData.basicSalary,
          allowance: initialData.allowance,
          leaveCredits: initialData.leaveCredits,
          region: initialData.region || "",
          province: initialData.province || "",
          municipality: initialData.municipality || "",
          barangay: initialData.barangay || "",
          street: initialData.street || "",
          zipCode: initialData.zipCode || "",
        });
      } else {
        reset({
          employeeId: "",
          role: "EMPLOYEE",
          firstName: "",
          lastName: "",
          middleName: "",
          extensionName: null,
          birthDate: null,
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
          departmentId: "", 
          positionId: "",
          status: "",
          employmentType: "",
          scheduleId: "",
          basicSalary: 0,
          allowance: 0,
          leaveCredits: 15,
          region: "",
          province: "",
          municipality: "",
          barangay: "",
          street: "",
          zipCode: "",
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleUpload = async (file: File, employeeId: number, docType: string) => {
    const formData = new FormData();
    formData.append('documentFile', file);

    try {
      // Direct API upload integration here
      const response = await api.post(`/documents/${employeeId}/${docType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notificationService.toast(`${docType} uploaded successfully!`);
    } catch (err) {
      notificationService.toast("Upload failed!", "error");
    }
  };

  if (!isOpen) return null;

  const onSubmit = (data: EmployeeFormInput) => {
    const formattedPayload = {
      ...data,
      departmentId: data.departmentId ? parseInt(data.departmentId) : null,
      positionId: data.positionId ? parseInt(data.positionId) : null,
      scheduleId: data.scheduleId ? parseInt(data.scheduleId) : null,
      basicSalary: Number(data.basicSalary) || 0,
      allowance: Number(data.allowance) || 0,
      leaveCredits: Number(data.leaveCredits) || 0,
      ...(initialData && { id: initialData.id })
    };

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
    { id: 'documents', label: 'Documents', icon: <FolderClosed size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-full max-w-6xl h-[750px] max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* HEADER */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {initialData ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-0">
              {initialData ? 'Update the details of the selected employee.' : 'Register a new member to the system.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors text-white outline-none">
            <X size={20} />
          </button>
        </div>

        {/* MAIN FORM AREA */}
        <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden bg-white">
          
          {/* LEFT SIDEBAR (TABS) */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-2 space-y-2 hidden md:flex flex-col shrink-0 justify-between">
            <div className="space-y-2">
              <div className="my-4 px-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Form Sections</span>
              </div>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 !rounded-md font-semibold text-sm transition-all text-left ${
                    activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            <Alert variant="primary" className='mb-2 mx-2 border-none bg-blue-50/50'>
              <div className='flex gap-2'>
                <Info className='text-blue-500 shrink-0' size={18}/> 
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-0">
                  Make sure all required fields marked with <span className='text-red-600 text-md'>*</span> are filled out correctly.
                </p>
              </div>
            </Alert>
          </div>

          {/* RIGHT SIDE PANEL (CONTENT + ACTION FOOTER) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* SCROLLABLE VIEW CONTENTS */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              {/* PERSONAL TAB */}
              {activeTab === 'personal' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-0">Personal Information</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Step 1 of 6</span>
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
                      placeholder="Select birthday"
                      maxDate={new Date()}
                    />
                    <div className="space-y-1 flex flex-col">
                      <label className="text-[12px] font-bold text-slate-400 uppercase">Age</label>
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
                    <FormInput
                      label="Initial Password"
                      type="password"
                      reqField={true}
                      placeholder="••••••••"
                      error={errors.password}
                      {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                    />
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
                        } rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all font-normal text-[13px]`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1 tracking-tight mb-0">
                          <AlertCircle size={12} /> {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="pt-4">
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
              
              {/* GOVERNMENT TAB */}
              {activeTab === 'government' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-0">Government IDs</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Step 2 of 6</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="TIN Number"
                      type="text"
                      reqField={true}
                      placeholder="111-***-***-***"
                      error={errors.tinNo}
                      {...register("tinNo", { required: "TIN Number is required" })}
                    />
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
                    <FormInput
                      label="PhilHealth Number"
                      type="text"
                      reqField={true}
                      placeholder="111-***-***-***"
                      error={errors.philhealthNo}
                      {...register("philhealthNo", { required: "PhilHealth Number is required" })}
                    />
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
              
              {/* EMPLOYMENT TAB */}
              {activeTab === 'employment' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-0">Employment Details</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Step 3 of 6</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormSelect 
                      label="Department"
                      reqField={true}
                      error={errors.departmentId}
                      {...register("departmentId", { required: "Department is required" })}
                      options={departments.map((dept: any) => ({
                        label: dept.name,
                        value: dept.id
                      }))} 
                    />
                    <FormSelect 
                      label="Position"
                      reqField={true}
                      error={errors.positionId}
                      {...register("positionId", { required: "Position is required" })}
                      options={positions.map((pos: any) => ({
                        label: pos.title,
                        value: pos.id
                      }))} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormSelect 
                      label="Employment Status"
                      reqField={true}
                      options={ENUMS.EMPLOYMENT_STATUS} 
                      error={errors.status}
                      {...register("status", { required: "Employment Status is required" })} 
                    />
                    <FormSelect 
                      label="Employment Type"
                      reqField={true}
                      options={ENUMS.EMPLOYMENT_TYPE} 
                      error={errors.employmentType}
                      {...register("employmentType", { required: "Employment Type is required" })} 
                    />
                    <FormSelect 
                      label="Schedule"
                      reqField={true}
                      error={errors.scheduleId}
                      {...register("scheduleId", { required: "Schedule is required" })}
                      options={schedules.map((sched: any) => ({
                        label: `${sched.name}: (${formatShiftSchedule(sched.shiftStart)} - ${formatShiftSchedule(sched.shiftEnd)})`,
                        value: sched.id
                      }))} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Basic Salary"
                      type="number"
                      reqField={true}
                      placeholder="0.00"
                      error={errors.basicSalary}
                      {...register("basicSalary", { 
                        required: "Basic Salary is required",
                        min: { value: 1, message: "Salary must be greater than 0" },
                        valueAsNumber: true
                      })}
                    />
                    <FormInput
                      label="Allowance"
                      type="number"
                      reqField={true}
                      placeholder="0.00"
                      error={errors.allowance}
                      {...register("allowance", { 
                        required: "Allowance is required",
                        min: { value: 1, message: "Allowance must be greater than 0" },
                        valueAsNumber: true
                      })}
                    />
                    <FormInput
                      label="Leave Credits"
                      type="number"
                      reqField={true}
                      placeholder="0.0"
                      error={errors.leaveCredits}
                      {...register("leaveCredits", { required: "Leave Credits is required", valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}

              {/* ADDRESS TAB */}
              {activeTab === 'address' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-0">Address Details</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Step 4 of 6</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput 
                      label="Region"
                      placeholder="Region here..."
                      reqField={false}
                      error={errors.region}
                      {...register("region")} 
                    />
                    <FormInput 
                      label="Province"
                      placeholder="Province here..."
                      reqField={false}
                      error={errors.province}
                      {...register("province")} 
                    />
                    <FormInput 
                      label="Municipality"
                      placeholder="Municipality here..."
                      reqField={false}
                      error={errors.municipality}
                      {...register("municipality")} 
                    />
                    <FormInput 
                      label="Barangay"
                      placeholder="Barangay here..."
                      reqField={false}
                      error={errors.barangay}
                      {...register("barangay")} 
                    />
                    <FormInput 
                      label="Street"
                      placeholder="Street here..."
                      reqField={false}
                      error={errors.street}
                      {...register("street")} 
                    />
                    <FormInput 
                      label="ZIP Code"
                      placeholder="Zip Code here..."
                      reqField={false}
                      error={errors.zipCode}
                      {...register("zipCode")} 
                    />
                  </div>
                </div>
              )}

              {/* BANK ACCOUNT TAB */}
              {activeTab === 'bankaccount' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-0">Bank Account Details</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Step 5 of 6</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput 
                      label="Bank Account Name"
                      placeholder="Bank name here..."
                      reqField={false}
                      error={errors.bankName}
                      {...register("bankName")} 
                    />
                    <FormInput 
                      label="Bank Account Number"
                      placeholder="Bank number here..."
                      reqField={false}
                      error={errors.bankAccountNo}
                      {...register("bankAccountNo")} 
                    />
                  </div>
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === 'documents' && (
                <div className="animate-in slide-in-from-right-4 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h4 className="text-lg font-bold text-slate-800 mb-0">
                        Documents
                        <p className="text-xs text-slate-400 mt-1 font-normal normal-case tracking-normal">
                          Upload and verify compliance requirements. Acceptable formats: PDF, PNG, JPG (Max 5MB per file).
                        </p>
                      </h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Step 6 of 6</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-emerald-800 text-[11px] font-medium">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>All uploaded files are encrypted at rest and compliant with local data privacy laws.</span>
                  </div>

                  <div className="w-full border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Requirement</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">File Details</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[13px]">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-slate-700 flex items-center gap-1">
                                {doc.name}
                                {doc.required && <span className="text-red-500 font-bold">*</span>}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">{doc.description}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              {doc.status === 'UPLOADED' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                                  <CheckCircle2 size={12} /> Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-100">
                                  <AlertCircle size={12} /> Missing
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 font-medium">
                              {doc.fileName ? (
                                <div>
                                  <div className="text-slate-700 font-semibold truncate max-w-[200px] flex items-center gap-1">
                                    <FileText size={14} className="text-slate-400 shrink-0" /> {doc.fileName}
                                  </div>
                                  <div className="text-[10px] text-slate-400">{doc.fileSize}</div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic font-normal text-xs">No file attached</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {doc.status === 'UPLOADED' ? (
                                  <>
                                    <button type="button" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all" title="View Document">
                                      <Eye size={16} />
                                    </button>
                                    <button type="button" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Delete Document">
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <label className="!flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white rounded-md transition-all text-xs font-bold cursor-pointer shadow-sm mb-0">
                                    <UploadCloud size={14} />
                                    <span>Upload</span>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      accept=".pdf,.png,.jpg,.jpeg" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUpload(file, initialData?.id || 0, doc.docType);
                                      }} 
                                    />
                                  </label>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* PERSISTENT ACTIONS FOOTER AREA */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-slate-200 text-slate-600 bg-white rounded-md font-semibold text-sm hover:bg-slate-100 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md shadow-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Saving Account...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{initialData ? 'Update Profile' : 'Save Employee'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;