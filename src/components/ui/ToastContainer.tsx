// ============================================================
// நினைவு (Ninaivu) — Toast Container
// ============================================================

import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={18} className={`toast-icon-${toast.type}`} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{toast.message}</span>
            <button
              className="btn btn-icon btn-ghost"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
              style={{ padding: '4px', minHeight: 'auto', minWidth: 'auto' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
