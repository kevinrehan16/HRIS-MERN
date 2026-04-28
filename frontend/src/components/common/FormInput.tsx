import React, { forwardRef, InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import type { FieldError } from 'react-hook-form';

// 1. I-define ang Props interface
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError; // Support para sa errors ng react-hook-form
  reqField: boolean;
}

// 2. Gamitin ang forwardRef na may Types (Element, Props)
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, reqField, type = "text", className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {/* Label */}
        <label className="text-[12px] font-bold text-slate-400 uppercase">
          {label} <span className={`${reqField ? '!text-red-600 text-md' : 'd-none'}`}>*</span>
        </label>

        {/* Input Field */}
        <input
          ref={ref}
          type={type}
          {...props}
          className={`w-full p-2 bg-slate-50 border ${
            error ? '!border-red-500' : 'border-slate-200'
          } rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all font-normal text-[11px] ${className}`}
        />

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

FormInput.displayName = "FormInput";

export default FormInput;