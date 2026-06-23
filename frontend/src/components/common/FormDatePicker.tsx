import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from 'react-hook-form'; 
// 👇 1. IDINAGDAG: Kinuha natin itong dalawang helper types mula sa react-hook-form
import type { Control, FieldValues, FieldPath } from 'react-hook-form'; 
import { AlertCircle } from 'lucide-react';

// 👇 2. INAYOS: Ginawa nating Generic `<TFieldValues extends FieldValues>` ang interface
interface FormDatePickerProps<TFieldValues extends FieldValues> {
  label: string;
  name: FieldPath<TFieldValues>; // Kinukuha nito nang kusa ang mga valid na fields ng form mo (e.g., "birthDate")
  control: Control<TFieldValues>; // Tutugma na ito sa kung anong useForm() ang gamit mo sa labas
  error?: any;
  placeholder?: string;
  maxDate?: Date;
  reqField: boolean;
}

// 👇 3. INAYOS: Idinagdag ang `<TFieldValues extends FieldValues>` bago ang parameters
const FormDatePicker = <TFieldValues extends FieldValues>({ 
  label, 
  name, 
  reqField, 
  control, 
  error, 
  placeholder, 
  maxDate 
}: FormDatePickerProps<TFieldValues>) => {
  return (
    <div className="col-span-2 md:col-span-1 space-y-1 flex flex-col">
      <label className="text-[12px] font-bold text-slate-400 uppercase">
        {label} {reqField && <span className="text-red-600 text-md">*</span>}
      </label>

      <Controller
        control={control}
        name={name}
        rules={{ 
          required: reqField ? `${label} is required` : false 
        }}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onChange={(date) => field.onChange(date)}
            placeholderText={placeholder}
            maxDate={maxDate}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100} 
            dateFormat="MMMM d, yyyy"
            wrapperClassName="w-full" 
            className={`w-full p-2 bg-slate-50 border ${
              error ? '!border-red-500 !focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
            } rounded-md focus:ring-2 outline-none transition-all font-normal text-[13px] text-slate-600`}
          />
        )}
      />

      {error && (
        <span className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1 animate-in fade-in duration-200">
          <AlertCircle size={12} /> {error.message}
        </span>
      )}
    </div>
  );
};

export default FormDatePicker;