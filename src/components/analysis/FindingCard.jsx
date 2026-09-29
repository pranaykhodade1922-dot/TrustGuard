import React from 'react';
import { ShieldAlert, ShieldCheck, MapPin, Info, ArrowRight, Eye, Shield } from 'lucide-react';
import { Badge } from '../common/Badge';

export function FindingCard({ finding, isSelected, onClick, onHover }) {
  if (!finding) return null;

  const categoryBadges = {
    privacy: { variant: 'warning', label: 'Privacy' },
    credential: { variant: 'danger', label: 'Credential Risk' },
    financial: { variant: 'warning', label: 'Financial' },
    socialEngineering: { variant: 'purple', label: 'Social Engineering' },
  };

  const badgeInfo = categoryBadges[finding.category] || { variant: 'neutral', label: finding.categoryLabel || 'Security' };

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={`border rounded-lg p-4 transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'bg-blue-50/40 border-[#2563EB] shadow-xs ring-1 ring-[#2563EB]/20'
          : 'bg-white border-[#E5E7EB] hover:border-gray-300 hover:bg-[#FAFAFA]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="text-xs font-semibold text-[#111827] flex items-center gap-1.5">
            <span>{finding.type}</span>
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={badgeInfo.variant} size="sm">
              {badgeInfo.label}
            </Badge>
            <span className="text-[11px] font-medium text-[#6B7280] flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                finding.severity === 'High' ? 'bg-[#DC2626]' : finding.severity === 'Medium' ? 'bg-[#D97706]' : 'bg-[#2563EB]'
              }`} />
              {finding.severity} Severity
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
          <MapPin className="w-2.5 h-2.5" />
          Location verified
        </span>
      </div>

      {/* Exact Flagged Text */}
      <div className="my-2.5 p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded font-mono text-xs text-[#111827] break-all select-all flex items-center justify-between gap-2">
        <span className="text-[#991B1B] font-semibold bg-[#FEE2E2] px-1.5 py-0.5 rounded">
          "{finding.text}"
        </span>
        {finding.redaction && (
          <span className="text-[10px] font-sans text-[#6B7280] shrink-0">
            Redacts to: <span className="font-mono text-[#2563EB]">{finding.redaction}</span>
          </span>
        )}
      </div>

      {/* Why this matters */}
      <div className="mt-2.5 pt-2 border-t border-[#F3F4F6]">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[#6B7280] mb-0.5 flex items-center gap-1">
          <Info className="w-3 h-3 text-[#2563EB]" />
          Why this matters
        </div>
        <p className="text-xs text-[#4B5563] leading-relaxed">
          {finding.explanation}
        </p>
      </div>

      {/* Remediation note */}
      {finding.recommendation && (
        <div className="mt-2 text-[11px] text-[#6B7280] bg-[#F8F9FA] p-2 rounded border border-[#E5E7EB]/60">
          <span className="font-medium text-[#111827]">Mitigation:</span> {finding.recommendation}
        </div>
      )}
    </div>
  );
}
