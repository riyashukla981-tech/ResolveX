// src/hooks/useToast.ts
import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastState {
  toasts: Toast[];
  toast: (type: ToastType, title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

export function useToast(): ToastState {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}

// Global toast singleton
let globalToast: ((type: ToastType, title: string, message?: string) => void) | null = null;

export function setGlobalToast(fn: (type: ToastType, title: string, message?: string) => void) {
  globalToast = fn;
}

export function showToast(type: ToastType, title: string, message?: string) {
  if (globalToast) globalToast(type, title, message);
}