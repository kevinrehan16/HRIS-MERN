import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import type { FieldError } from 'react-hook-form';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: FieldError;
  reqField: boolean;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, reqField, error, className = "", ...props }, ref) => {
    return (
      <div className="col-span-2 md:col-span-1 space-y-1">
        <label className="text-[12px] font-bold text-slate-400 uppercase">
          {label} <span className={`${reqField ? '!text-red-600 text-md' : 'd-none'}`}>*</span>
        </label>
        
        <select
          ref={ref}
          {...props}
          className={`w-full p-2 bg-slate-50 border ${
            error ? '!border-red-500' : 'border-slate-200'
          } rounded-md outline-none text-[11px] ${className}`}
        >
          <option value="" className='text-slate-500'>--Select {label}--</option>
          {options?.map((option, index) => {
            // 1. Kung ang option ay OBJECT (galing sa database: {label, value})
            if (typeof option === 'object' && option !== null) {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            }

            // 2. Kung ang option ay STRING (galing sa Enum constant: "MALE")
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          })}
        </select>
        
        {/* Error Message */}
        {error && (
          <span className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1 tracking-tight">
            <AlertCircle size={12} /> {error.message}
          </span>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
export default FormSelect;