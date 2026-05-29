// src/components/ui/Toast.tsx
import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
};

const BG: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
  warning: 'border-l-yellow-500',
};

export const ToastItem: React.FC<ToastProps> = ({ id, type, title, message, onDismiss }) => (
  <div className={`flex items-start gap-3 bg-white border border-gray-200 border-l-4 ${BG[type]} rounded-lg shadow-lg p-4 min-w-[300px] max-w-sm animate-slide-up`}>
    <div className="shrink-0 mt-0.5">{ICONS[type]}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {message && <p className="text-xs text-gray-500 mt-0.5">{message}</p>}
    </div>
    <button onClick={() => onDismiss(id)} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
      <X className="w-4 h-4" />
    </button>
  </div>
);

interface ToastContainerProps {
  toasts: { id: string; type: ToastType; title: string; message?: string }[];
  dismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, dismiss }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map((t) => (
      <ToastItem key={t.id} {...t} onDismiss={dismiss} />
    ))}
  </div>
);