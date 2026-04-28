import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from 'react-hook-form'; // Code ito
import type { Control } from 'react-hook-form'; // Type lang ito
import { AlertCircle } from 'lucide-react';

interface FormDatePickerProps {
  label: string;
  name: string;
  control: Control<any>;
  error?: any;
  placeholder?: string;
  maxDate?: Date;
  reqField: boolean;
}

const FormDatePicker = ({ label, name, reqField, control, error, placeholder, maxDate }: FormDatePickerProps) => {
  return (
    <div className="col-span-2 md:col-span-1 space-y-1 flex flex-col">
      <label className="text-[12px] font-bold text-slate-400 uppercase">
        {label} <span className={`${reqField ? '!text-red-600 text-md' : 'd-none'}`}>*</span>
      </label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onChange={(date) => field.onChange(date)}
            placeholderText={placeholder}
            maxDate={maxDate}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={60} // Pakita ang huling 60 years
            dateFormat="MMMM d, yyyy"
            className={`w-full p-2 bg-slate-50 border ${
              error ? '!border-red-500' : 'border-slate-200'
            } rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all font-normal text-[11px]`}
          />
        )}
      />

      {error && (
        <span className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1">
          <AlertCircle size={12} /> {error.message}
        </span>
      )}
    </div>
  );
};

export default FormDatePicker;