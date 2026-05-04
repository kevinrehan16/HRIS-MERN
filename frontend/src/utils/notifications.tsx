import { renderToString } from 'react-dom/server';
import Swal from 'sweetalert2';

import { X, CircleOff, CheckCircle } from 'lucide-react';

// 1. Setup para sa Toast (Yung lilitaw sa gilid)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const notificationService = {
  // Para sa Success/Error Toasts
  toast: (title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    Toast.fire({
      icon,
      title
    });
  },

  // Para sa Delete Confirmation (Reusable)
  confirm: async (title: string, text: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6', // blue-600
      cancelButtonColor: '#ef4444',  // red-500
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      // Dagdag styling para magmukhang modern
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-semibold'
      }
    });
  },

  prompt: async (title: string, text: string, placeholder: string, type = "reject") => {
    // 1. Pre-compute Icons and Colors
    const iconHtml = type === 'reject' 
      ? renderToString(<CircleOff size={16} />) 
      : renderToString(<CheckCircle size={16} />);
    
    const cancelIconHtml = renderToString(<X size={16} />);
    const buttonLabel = type === 'reject' ? 'Confirm Reject' : 'Submit Request';
    const confirmBgColor = type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600';

    return Swal.fire({
      title,
      html: `<p class="text-sm text-slate-500 text-left px-1">${text}</p>`,
      input: 'textarea',
      inputPlaceholder: placeholder,
      showCancelButton: true,
      
      // 2. Button Texts
      confirmButtonText: `<span class="flex items-center gap-2">${iconHtml} ${buttonLabel}</span>`,
      cancelButtonText: `<span class="flex items-center gap-2">${cancelIconHtml} Cancel</span>`,
      
      // 3. Layout Settings
      reverseButtons: true, 
      buttonsStyling: false, // OFF natin ang default SWAL styles para gumana ang Tailwind
      
      inputValidator: (value) => {
        if (!value) return 'Kailangan ng rason!';
      },

      // 4. Final CSS Overrides
      customClass: {
        popup: '!rounded-md !p-2',
        header: '!text-left ml-4',
        title: '!text-left ml-4 pt-4',
        input: '!rounded-md text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500 mx-6 my-2 w-[calc(100%-3rem)]',
        
        // Eto ang pilitan sa kanan:
        actions: 'flex !justify-end !w-full !px-8 pb-4 gap-3', 
        
        confirmButton: `!rounded-md px-6 py-2.5 font-semibold text-white shadow-sm transition-colors ${confirmBgColor}`,
        cancelButton: '!rounded-md px-6 py-2.5 font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors'
      }
    });
  }
};