import { useToastStore, ToastType } from './use-toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeStyles: Record<ToastType, { border: string; icon: React.ReactNode; bg: string }> = {
  success: {
    border: 'border-l-green-500',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    bg: 'bg-white',
  },
  error: {
    border: 'border-l-red-500',
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    bg: 'bg-white',
  },
  info: {
    border: 'border-l-blue-500',
    icon: <Info className="h-5 w-5 text-blue-500" />,
    bg: 'bg-white',
  },
  warning: {
    border: 'border-l-amber-500',
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    bg: 'bg-white',
  },
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => {
        const style = typeStyles[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
              style.bg,
              style.border,
              "border-y-gray-200 border-r-gray-200"
            )}
          >
            <div className="shrink-0 mt-0.5">{style.icon}</div>
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-gray-900">{t.title}</p>
              {t.message && (
                <p className="mt-1 text-sm text-gray-500">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
