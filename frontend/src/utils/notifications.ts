import Swal from 'sweetalert2';

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
  }
};