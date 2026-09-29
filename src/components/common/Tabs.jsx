import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 border-b border-[#E5E7EB] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                : 'border-transparent text-[#6B7280] hover:text-[#111827] hover:border-gray-300'
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 border border-dashed border-[#E5E7EB] rounded-lg bg-[#FAFAFA] ${className}`}>
      {Icon && (
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
      {description && <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">{description}</p>}
      {actionText && onAction && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
          >
            {actionText} &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
