import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
  
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
  
  custom: (message: string, options?: any) => {
    toast(message, options);
  },

  clickable: (message: string, onClick: () => void, options?: any) => {
    toast(
      (t) => (
        <div
          onClick={() => {
            onClick();
            toast.dismiss(t.id);
          }}
          className="cursor-pointer flex items-center space-x-3 w-full"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick();
              toast.dismiss(t.id);
            }
          }}
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Click to continue</p>
          </div>
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ),
      {
        duration: 6000,
        ...options,
      }
    );
  },
};
