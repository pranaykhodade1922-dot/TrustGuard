import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-[#E5E7EB]';
        let bgClass = 'bg-white';
        let iconColor = 'text-[#2563EB]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconColor = 'text-[#16A34A]';
          borderClass = 'border-[#BBF7D0]';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-[#D97706]';
          borderClass = 'border-[#FDE68A]';
        } else if (toast.type === 'danger' || toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-[#DC2626]';
          borderClass = 'border-[#FECACA]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-sm ${bgClass} ${borderClass} transition-all duration-200 text-xs text-[#111827]`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9CA3AF] hover:text-[#4B5563] p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
