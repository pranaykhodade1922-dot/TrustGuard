import React, { useRef, useState } from 'react';
import {
  Upload,
  Trash2,
  Shield,
  Info,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  UserCheck,
  KeyRound,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { RiskIndicator, CategoryRiskCards } from '../components/common/RiskIndicator';
import { FindingCard } from '../components/analysis/FindingCard';
import { RedactedPreview } from '../components/analysis/RedactedPreview';
import { ActionPanel } from '../components/analysis/ActionPanel';
import { LoadingProgress } from '../components/analysis/LoadingProgress';
import { useApp } from '../context/AppContext';

// Realistic sample checks for demonstration (Fictional, non-production data only)
const EXAMPLE_CHECKS = [
  {
    id: 'example-pii',
    title: 'Personal Information',
    category: 'Privacy',
    icon: UserCheck,
    iconColor: 'text-[#D97706]',
    iconBg: 'bg-[#FEF3C7] border-[#FDE68A]',
    badgeLabel: 'PII Check',
    description: 'Detect personal data such as email addresses and phone numbers.',
    content: `Hi John,

Please contact me at pranay.demo@example.com
or call me at +91 98765 43210 regarding the account update.

Thanks.`,
  },
  {
    id: 'example-credentials',
    title: 'Credentials & Secrets',
    category: 'Credentials',
    icon: KeyRound,
    iconColor: 'text-[#DC2626]',
    iconBg: 'bg-[#FEE2E2] border-[#FECACA]',
    badgeLabel: 'Secret Check',
    description: 'Identify passwords, credentials, and secret-like information before sharing.',
    demoNotice: 'Demo data — do not use real credentials.',
    content: `Hello Team,

Here are the temporary credentials for the demo account:

Username: demo.user@example.com
Password: TrustGuardDemo123!

Please change the password after the first login.`,
  },
  {
    id: 'example-phishing',
    title: 'Phishing & Social Engineering',
    category: 'Social Eng.',
    icon: AlertTriangle,
    iconColor: 'text-[#7C3AED]',
    iconBg: 'bg-[#F3E8FF] border-[#E9D5FF]',
    badgeLabel: 'Threat Check',
    description: 'Detect urgency, suspicious links, impersonation, and requests for sensitive information.',
    content: `URGENT!

Your account will be permanently suspended within 30 minutes.

Click the link below immediately to verify your account:
http://account-verification-example.com

Send your verification code and password to complete the verification.`,
  },
  {
    id: 'example-safe',
    title: 'Safe Message',
    category: 'Benign',
    icon: ShieldCheck,
    iconColor: 'text-[#16A34A]',
    iconBg: 'bg-[#DCFCE7] border-[#BBF7D0]',
    badgeLabel: 'Clean Check',
    description: 'See how TrustGuard handles ordinary, low-risk content.',
    content: `Hi team,

Our meeting is scheduled for tomorrow at 10 AM.
Please review the project notes before the meeting.

Thanks.`,
  },
];

export function AnalyzePage() {
  const {
    activeText,
    setActiveText,
    currentAnalysis,
    setCurrentAnalysis,
    isAnalyzing,
    performAnalysis,
    recordDecision,
    showToast,
  } = useApp();

  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const handleTextChange = (e) => {
    setActiveText(e.target.value);
  };

  const handleClear = () => {
    setActiveText('');
    setCurrentAnalysis(null);
    setSelectedFindingId(null);
  };

  const handleLoadExample = (content) => {
    setActiveText(content);
    setCurrentAnalysis(null);
    setSelectedFindingId(null);
    showToast('Example check loaded into editor. Click "Analyze & Protect" to inspect.', 'info');
    if (editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('File size exceeds 2MB limit', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setActiveText(content);
        setCurrentAnalysis(null);
        setSelectedFindingId(null);
        showToast(`Imported ${file.name} successfully`, 'success');
      }
    };
    reader.onerror = () => {
      showToast("We couldn't read this file. Please try again.", 'error');
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleRunAnalysis = async () => {
    if (!activeText.trim()) {
      showToast('Please paste or write some content to analyze', 'warning');
      return;
    }

    const result = await performAnalysis(activeText);
    if (result && result.findings && result.findings.length > 0) {
      setSelectedFindingId(result.findings[0].id);
    }
  };

  const charCount = activeText.length;
  const wordCount = activeText.trim() ? activeText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
          Analyze Content
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
          Paste your content or upload a document to inspect prior to dispatch.
        </p>
      </div>

      {/* Primary Input Editor Card */}
      <div ref={editorRef} className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
        {/* Editor Top Toolbar */}
        <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#111827]">Content Input</span>
            <span className="text-[11px] text-[#9CA3AF]">|</span>
            <span className="text-[11px] text-[#6B7280]">
              Plaintext, Email draft, Document excerpt, or AI system prompt
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Button */}
            {activeText && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-xs font-medium text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear editor"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={8}
            value={activeText}
            onChange={handleTextChange}
            placeholder="Paste your content or upload a document..."
            className="w-full p-4 text-xs sm:text-sm font-sans text-[#111827] placeholder:text-[#9CA3AF] bg-white border-0 resize-y focus:outline-none leading-relaxed"
          />
        </div>

        {/* Editor Bottom Meta Bar */}
        <div className="px-4 py-2.5 bg-[#F9FAFB] border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">
              {charCount.toLocaleString()} {charCount === 1 ? 'character' : 'characters'}
            </span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="font-mono text-[11px]">{wordCount} words</span>
            {currentAnalysis && (
              <span className="text-[11px] text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0] hidden sm:inline">
                Analysis synchronized
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.json,.csv,.log,.xml,.yml"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-medium text-[#4B5563] bg-white border border-[#D1D5DB] rounded hover:bg-[#F3F4F6] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload document</span>
            </button>

            <Button
              size="sm"
              variant="primary"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !activeText.trim()}
              isLoading={isAnalyzing}
              className="font-medium cursor-pointer"
            >
              Analyze &amp; Protect
            </Button>
          </div>
        </div>
      </div>

      {/* Example Checks Section */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Example Checks</span>
            </h3>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Try a sample check to see how TrustGuard detects, explains, and protects sensitive content.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {EXAMPLE_CHECKS.map((example) => {
            const IconComponent = example.icon;
            return (
              <div
                key={example.id}
                className="bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${example.iconBg}`}>
                      <IconComponent className={`w-4 h-4 ${example.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      {example.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#111827]">
                    {example.title}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                    {example.description}
                  </p>

                  {example.demoNotice && (
                    <div className="mt-2 text-[10px] text-[#9CA3AF] italic">
                      {example.demoNotice}
                    </div>
                  )}
                </div>

                <div className="pt-3.5 mt-3 border-t border-[#F3F4F6]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadExample(example.content)}
                    className="w-full text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Try Example</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="p-8 bg-white border border-[#E5E7EB] rounded-xl text-center shadow-xs">
          <Clock className="w-7 h-7 mx-auto mb-3 text-[#2563EB] animate-spin" />
          <h3 className="text-sm font-semibold text-[#111827]">Executing TrustGuard Security Inspection</h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
            Evaluating deterministic identifiers, credentials, financial records, and contextual social-engineering threats.
          </p>
        </div>
      )}

      {/* Real Analysis Results View */}
      {!isAnalyzing && currentAnalysis && (
        <div className="space-y-6 pt-2">
          {/* Top Risk Indicator Bar */}
          <RiskIndicator
            score={currentAnalysis.score}
            level={currentAnalysis.level}
            issuesCount={currentAnalysis.issuesCount}
          />

          {/* Category Breakdown */}
          {currentAnalysis.categories && (
            <CategoryRiskCards categories={currentAnalysis.categories} />
          )}

          {/* Exact Flagged Content & Detected Issues */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <span>Detected Issues</span>
                  <span className="text-xs font-mono font-normal text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {currentAnalysis.findings.length} {currentAnalysis.findings.length === 1 ? 'finding' : 'findings'}
                  </span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Exact flagged content with verbatim input verification and risk justification
                </p>
              </div>

              {currentAnalysis.findings.length === 0 && (
                <span className="text-xs text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded font-medium border border-[#BBF7D0]">
                  No security vulnerabilities detected
                </span>
              )}
            </div>

            {currentAnalysis.findings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentAnalysis.findings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    isSelected={selectedFindingId === finding.id}
                    onClick={() => setSelectedFindingId(finding.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white border border-[#E5E7EB] rounded-lg text-center text-xs text-[#6B7280]">
                Clean content. No sensitive identifiers, API secrets, or social engineering signals found.
              </div>
            )}
          </div>

          {/* Protected Version & Side-by-Side Comparison */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#111827]">Remediation &amp; Protection</h3>
            <RedactedPreview
              originalText={currentAnalysis.originalText}
              protectedText={currentAnalysis.protectedText}
              findings={currentAnalysis.findings}
              selectedFindingId={selectedFindingId}
              onSelectFinding={(id) => setSelectedFindingId(id)}
            />
          </div>

          {/* Action Panel */}
          <ActionPanel
            issuesCount={currentAnalysis.issuesCount}
            onActionDecided={(action) => {
              recordDecision(action);
            }}
          />
        </div>
      )}
    </div>
  );
}
