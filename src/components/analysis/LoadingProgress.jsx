import React from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

export function LoadingProgress({ step = 1 }) {
  const steps = [
    { id: 1, label: 'Checking sensitive information' },
    { id: 2, label: 'Checking credentials & secrets' },
    { id: 3, label: 'Analyzing security & social signals' },
    { id: 4, label: 'Preparing protected version' },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 max-w-md mx-auto my-8 shadow-xs">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#F3F4F6]">
        <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Analyzing your content</h3>
          <p className="text-xs text-[#6B7280]">Running multi-vector trust and privacy inspection</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((item) => {
          const isDone = step > item.id;
          const isCurrent = step === item.id;
          const isUpcoming = step < item.id;

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between text-xs px-3 py-2 rounded transition-colors ${
                isCurrent ? 'bg-[#EFF6FF] text-[#1E40AF] font-medium' : 'text-[#4B5563]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-[#9CA3AF]">0{item.id}</span>
                <span>{item.label}</span>
              </div>

              <div>
                {isDone && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                {isCurrent && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[#2563EB]">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  </span>
                )}
                {isUpcoming && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[#9CA3AF]">
                    <Circle className="w-2.5 h-2.5 opacity-40" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-[#F3F4F6] flex justify-between items-center text-[11px] text-[#9CA3AF]">
        <span>Standard inspection cycle</span>
        <span>~1.5s latency</span>
      </div>
    </div>
  );
}
