import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

// Global toast state
let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
  success: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(7);
    toasts.push({ id, type: 'success', title, description });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  error: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(7);
    toasts.push({ id, type: 'error', title, description });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  info: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(7);
    toasts.push({ id, type: 'info', title, description });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  warning: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(7);
    toasts.push({ id, type: 'warning', title, description });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  },
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'border-success/30 bg-success/10',
  error: 'border-destructive/30 bg-destructive/10',
  info: 'border-info/30 bg-info/10',
  warning: 'border-warning/30 bg-warning/10',
};

const iconStyles = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-info',
  warning: 'text-warning',
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const Icon = icons[t.type];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-medium animate-slide-in-right',
        styles[t.type]
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconStyles[t.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{t.title}</p>
        {t.description && (
          <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
    >
      {currentToasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
