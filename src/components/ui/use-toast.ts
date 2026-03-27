import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, type: 'success' }),
  error: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, type: 'error' }),
  info: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, type: 'info' }),
  warning: (title: string, message?: string) => useToastStore.getState().addToast({ title, message, type: 'warning' }),
};
