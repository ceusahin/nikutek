import React from 'react';
import { toast } from 'react-toastify';

/**
 * Modern toast notifications for admin panel
 */

// Success notification
export const showSuccess = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Error notification
export const showError = (message) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Warning notification
export const showWarning = (message) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Info notification
export const showInfo = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Confirmation dialog using toast
export const showConfirm = (message, onConfirm, onCancel) => {
  return new Promise((resolve) => {
    const toastId = toast.warning(
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onConfirm) onConfirm();
              resolve(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Evet
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              if (onCancel) onCancel();
              resolve(false);
            }}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            İptal
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        style: { width: '400px' },
      }
    );
  });
};

// Loading toast
export const showLoading = (message = 'İşlem yapılıyor...') => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

// Update loading toast to success
export const updateToSuccess = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: 'success',
    isLoading: false,
    autoClose: 3000,
  });
};

// Update loading toast to error
export const updateToError = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: 'error',
    isLoading: false,
    autoClose: 4000,
  });
};

