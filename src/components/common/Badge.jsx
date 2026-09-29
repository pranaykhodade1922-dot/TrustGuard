import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'neutral', 'success', 'warning', 'danger', 'info', 'blue', 'purple'
  size = 'md',
  className = '',
}) {
  const variants = {
    neutral: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
    success: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
    blue: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
    purple: 'bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]',
  };

  const sizes = {
    sm: 'text-[11px] px-1.5 py-0.5 font-medium rounded',
    md: 'text-xs px-2 py-0.5 font-medium rounded',
    lg: 'text-xs px-2.5 py-1 font-semibold rounded-md',
  };

  return (
    <span className={`inline-flex items-center gap-1 border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
