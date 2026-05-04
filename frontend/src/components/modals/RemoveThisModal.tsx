import React from 'react'
import { X, Send } from 'lucide-react';

interface RequestOTModalProps {
  show: boolean;
  onClose: () => void;
}

const RequestOTModal:React.FC<RequestOTModalProps> = ({show, onClose}) => {

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg">Request OverTime</h3>
            <p className="text-sm text-slate-200 font-medium">Submit your overtime request for approval.</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
          <button 
            onClick={onClose}
            type="button" 
            className="px-6 py-2.5 font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 !rounded-md transition-all flex items-center gap-2 text-sm"
          >
            <X size={15} /> Cancel
          </button>
          <button 
            type="submit"
            form="employee-form"

            className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium !rounded-md shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 text-sm"
          >
            <Send size={15} /> Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export default RequestOTModal
