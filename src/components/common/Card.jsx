import React from 'react';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  noPadding = false,
}) {
  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 border-b border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            {title && <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 bg-[#F9FAFB] border-t border-[#F3F4F6] text-xs text-[#6B7280]">
          {footer}
        </div>
      )}
    </div>
  );
}
