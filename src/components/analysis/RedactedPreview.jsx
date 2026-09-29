import React, { useState } from 'react';
import { Copy, Check, Eye, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export function RedactedPreview({ originalText, protectedText, findings = [], onSelectFinding, selectedFindingId }) {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'diff', 'protected'

  const handleCopy = () => {
    navigator.clipboard.writeText(protectedText);
    setCopied(true);
    showToast('Protected version copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Render original text with highlighted flagged tokens
  const renderOriginalHighlighted = () => {
    if (!findings || findings.length === 0) {
      return <div className="whitespace-pre-wrap font-sans text-xs text-[#111827] leading-relaxed">{originalText}</div>;
    }

    // Sort findings by startIndex
    const sorted = [...findings].sort((a, b) => a.startIndex - b.startIndex);
    const elements = [];
    let currentIndex = 0;

    sorted.forEach((finding, idx) => {
      // Add text before finding
      if (finding.startIndex > currentIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {originalText.substring(currentIndex, finding.startIndex)}
          </span>
        );
      }

      // Add highlighted span
      const isSelected = selectedFindingId === finding.id;
      let highlightClass = 'highlight-privacy';
      if (finding.category === 'credential') highlightClass = 'highlight-credential';
      else if (finding.category === 'financial') highlightClass = 'highlight-financial';
      else if (finding.category === 'socialEngineering') highlightClass = 'highlight-social';

      elements.push(
        <mark
          key={`finding-${finding.id || idx}`}
          onClick={() => onSelectFinding && onSelectFinding(finding.id)}
          className={`cursor-pointer transition-all ${highlightClass} ${
            isSelected ? 'ring-2 ring-blue-500 font-semibold' : ''
          }`}
          title={`${finding.type} (${finding.severity} Risk) - Click to inspect`}
        >
          {originalText.substring(finding.startIndex, finding.endIndex)}
        </mark>
      );

      currentIndex = Math.max(currentIndex, finding.endIndex);
    });

    // Add trailing text
    if (currentIndex < originalText.length) {
      elements.push(
        <span key="trailing-text">
          {originalText.substring(currentIndex)}
        </span>
      );
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-xs text-[#111827] leading-relaxed">
        {elements}
      </div>
    );
  };

  // Calculate reduction metrics
  const redactedTokensCount = findings.length;
  const originalChars = originalText.length;
  const protectedChars = protectedText.length;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span className="text-xs font-semibold text-[#111827]">Content Remediation Preview</span>
          <span className="text-[11px] text-[#6B7280] hidden sm:inline">
            ({redactedTokensCount} {redactedTokensCount === 1 ? 'replacement' : 'replacements'} generated)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex rounded-md border border-[#E5E7EB] bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'split' ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode('protected')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'protected' ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Protected Only
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            className={copied ? 'text-[#16A34A] border-[#BBF7D0]' : ''}
          >
            {copied ? 'Copied!' : 'Copy Protected Version'}
          </Button>
        </div>
      </div>

      {/* Content comparison */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB]">
          {/* Left: Original with Highlighted Spans */}
          <div className="p-4 bg-[#FFFFFF]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#F3F4F6]">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                Original (Unprotected)
              </span>
              <span className="text-[11px] text-[#9CA3AF] font-mono">
                {originalChars} chars
              </span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded border border-[#E5E7EB] min-h-[160px] max-h-[340px] overflow-y-auto">
              {renderOriginalHighlighted()}
            </div>
            <div className="mt-2 text-[11px] text-[#6B7280] flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#F59E0B]" /> Privacy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#DC2626]" /> Credential
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#EA580C]" /> Financial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#7C3AED]" /> Social Eng
              </span>
            </div>
          </div>

          {/* Right: Protected Version */}
          <div className="p-4 bg-[#FAFAFA]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">
                  Protected Version
                </span>
                <span className="text-[10px] bg-[#DCFCE7] text-[#166534] px-1.5 py-0.2 rounded font-medium border border-[#BBF7D0]">
                  Safe to share
                </span>
              </div>
              <span className="text-[11px] text-[#9CA3AF] font-mono">
                {protectedChars} chars
              </span>
            </div>
            <div className="p-3 bg-white rounded border border-[#BBF7D0] min-h-[160px] max-h-[340px] overflow-y-auto">
              <div className="whitespace-pre-wrap font-sans text-xs text-[#111827] leading-relaxed selection:bg-green-100">
                {protectedText}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-[#166534] flex items-center justify-between">
              <span>All detected risks redacted and normalized</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[#2563EB] hover:underline font-medium cursor-pointer"
              >
                Copy to clipboard &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Protected Only View */
        <div className="p-5">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#F3F4F6]">
            <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">
              Protected Version Ready for Dispatch
            </span>
            <span className="text-[11px] text-[#6B7280] font-mono">
              {protectedChars} chars
            </span>
          </div>
          <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#BBF7D0]">
            <div className="whitespace-pre-wrap font-sans text-xs text-[#111827] leading-relaxed">
              {protectedText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
