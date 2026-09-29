import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export function RiskIndicator({ score = 0, level = 'SAFE', issuesCount = 0 }) {
  // Score percentage 0-100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine indicator color
  let barColor = 'bg-[#16A34A]';
  let textColor = 'text-[#16A34A]';
  let badgeColor = 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]';
  let Icon = ShieldCheck;

  if (normalizedScore >= 71) {
    barColor = 'bg-[#DC2626]';
    textColor = 'text-[#DC2626]';
    badgeColor = 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]';
    Icon = ShieldAlert;
  } else if (normalizedScore >= 41) {
    barColor = 'bg-[#D97706]';
    textColor = 'text-[#D97706]';
    badgeColor = 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]';
    Icon = AlertTriangle;
  } else if (normalizedScore >= 21) {
    barColor = 'bg-[#2563EB]';
    textColor = 'text-[#2563EB]';
    badgeColor = 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
    Icon = ShieldAlert;
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md border flex items-center justify-center shrink-0 ${badgeColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold">Security Analysis</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold tracking-tight text-[#111827]">{level}</span>
              <RiskBadge level={level} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2 sm:text-right">
          <span className="text-3xl font-extrabold tracking-tight text-[#111827]">{normalizedScore}</span>
          <span className="text-sm font-medium text-[#6B7280]">/ 100</span>
          <span className="ml-2 text-xs font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
            {issuesCount} {issuesCount === 1 ? 'issue' : 'issues'} detected
          </span>
        </div>
      </div>

      {/* Horizontal Clean Metric Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs text-[#6B7280] mb-1.5 font-medium">
          <span>Overall Threat Level</span>
          <span>
            {normalizedScore >= 71 ? 'Requires Redaction / Mitigation' : normalizedScore >= 41 ? 'Review Flagged Elements' : normalizedScore > 0 ? 'Low Sensitivity Signals' : 'Verified Clear'}
          </span>
        </div>
        <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden border border-[#E5E7EB]/60">
          <div
            className={`h-full ${barColor} transition-all duration-500 ease-out`}
            style={{ width: `${Math.max(5, normalizedScore)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function CategoryRiskCards({ categories }) {
  if (!categories) return null;

  const categoryList = [
    { key: 'privacy', label: 'Privacy Risk', data: categories.privacy, desc: 'Government IDs, PII & direct contact identifiers' },
    { key: 'credential', label: 'Credential Risk', data: categories.credential, desc: 'API keys, private tokens & passwords' },
    { key: 'financial', label: 'Financial Risk', data: categories.financial, desc: 'Cards, bank accounts, UPI & transfer demands' },
    { key: 'socialEngineering', label: 'Social Engineering', data: categories.socialEngineering, desc: 'Urgency coercion, impersonation & phishing links' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {categoryList.map(({ key, label, data, desc }) => {
        const level = data?.level || 'Safe';
        const count = data?.count || 0;

        let statusBg = 'bg-[#F9FAFB]';
        let statusBadge = 'success';

        if (level === 'High') {
          statusBg = 'bg-white border-[#FCA5A5]/60';
          statusBadge = 'danger';
        } else if (level === 'Medium') {
          statusBg = 'bg-white border-[#FCD34D]/60';
          statusBadge = 'warning';
        } else if (level === 'Low') {
          statusBg = 'bg-white border-[#BFDBFE]/60';
          statusBadge = 'blue';
        }

        return (
          <div key={key} className={`border border-[#E5E7EB] rounded-lg p-3.5 ${statusBg} transition-colors`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#111827]">{label}</span>
              <RiskBadge level={level} size="sm" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-[#6B7280]">Findings: <span className="font-semibold text-[#111827]">{count}</span></span>
              <span className="text-[11px] text-[#9CA3AF]">{count > 0 ? `${count} flagged` : 'No flags'}</span>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1.5 line-clamp-1 border-t border-[#F3F4F6] pt-1.5">
              {desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
