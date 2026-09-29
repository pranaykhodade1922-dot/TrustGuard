import React, { useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { Button } from './Button';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111827]/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative bg-white border border-[#E5E7EB] rounded-lg shadow-lg w-full ${maxWidth} z-10 overflow-hidden transform transition-all`}>
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
            {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Proceed',
  confirmVariant = 'danger',
  icon: Icon = AlertTriangle,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0 text-[#DC2626]">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#4B5563] leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-[#F3F4F6]">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          size="sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
