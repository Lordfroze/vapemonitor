'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error';
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'toast',
              toast.type === 'success' ? 'toast-success' : 'toast-error',
            )}
            role="alert"
          >
            <Icon className="toast-icon" />
            <div className="toast-message">
              <p className="font-medium">{toast.title}</p>
              {toast.message && (
                <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="dialog-close opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}