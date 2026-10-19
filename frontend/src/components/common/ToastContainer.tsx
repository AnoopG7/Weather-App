import { AlertCircle, Check, X } from "lucide-react";
import type { Toast } from "../../types";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        return (
          <div
            key={toast.id}
            className={`toast-pill ${isSuccess ? "toast-success" : "toast-error"}`}
            role="status"
          >
            {isSuccess ? (
              <Check size={16} className="text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-700 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              aria-label="Dismiss notification"
              className="toast-close-btn"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
