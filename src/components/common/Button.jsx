import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white focus:ring-[#2563EB]/40 shadow-xs border border-transparent',
    secondary: 'bg-[#F3F4F6] hover:bg-[#E5E7EB] active:bg-[#D1D5DB] text-[#111827] focus:ring-gray-300 border border-[#E5E7EB]',
    outline: 'bg-white hover:bg-[#F9FAFB] active:bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] focus:ring-gray-200',
    danger: 'bg-white hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] focus:ring-[#DC2626]/30',
    ghost: 'bg-transparent hover:bg-[#F3F4F6] text-[#4B5563] border border-transparent focus:ring-gray-200',
    dark: 'bg-[#111827] hover:bg-[#1F2937] text-white focus:ring-gray-600',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-md gap-2',
    lg: 'text-base px-5 py-2.5 rounded-md gap-2.5 font-medium',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
