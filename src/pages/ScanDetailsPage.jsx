import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Trash2,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskIndicator } from '../components/common/RiskIndicator';
import { FindingCard } from '../components/analysis/FindingCard';
import { ConfirmationModal } from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

/**
 * Generate plain-language explanation of scan findings
 */
function getRiskExplanation(flags = [], riskScore = 0) {
  if (!Array.isArray(flags) || flags.length === 0) {
    return 'No sensitive identifiers, exposed secrets, or threat patterns were detected in this content. The text was verified as safe to dispatch.';
  }

  const categories = new Set(flags.map((f) => (f.category || '').toUpperCase()));
  const parts = [];

  if (categories.has('CREDENTIAL')) {
    parts.push('high-risk authentication credentials or cryptographic secrets that could permit unauthorized system access if leaked');
  }
  if (categories.has('FINANCIAL')) {
    parts.push('sensitive financial account numbers or payment card details that risk financial fraud or regulatory non-compliance');
  }
  if (categories.has('PII')) {
    parts.push('personally identifiable information (such as email addresses, direct phone numbers, or government IDs) that can identify individuals');
  }
  if (categories.has('SOCIAL_ENGINEERING')) {
    parts.push('social-engineering indicators such as coercive urgency, authority impersonation, or deceptive instructions');
  }

  const detectedSummary = parts.length > 0 ? parts.join(', as well as ') : 'sensitive patterns';
  return `This check detected ${flags.length} verified security finding${flags.length === 1 ? '' : 's'} containing ${detectedSummary}. Sharing this content in unredacted form creates substantial exposure risks. We strongly recommend using the protected redacted version.`;
}

export function ScanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, fetchScans } = useApp();

  const [scan, setScan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedProtected, setCopiedProtected] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // Action Workflow State (PRD Section 4, 10, 11, 12, 13, 14, 20)
  const [isSavingAction, setIsSavingAction] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isEditingAction, setIsEditingAction] = useState(false);

  // Load real scan record from backend GET /api/scans/:id
  const loadScan = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.scans.getById(id);
      const raw = res.scan || res.data;

      if (!raw) {
        setErrorMessage('Scan record not found or access denied.');
        return;
      }

      const score = typeof raw.riskScore === 'number' ? raw.riskScore : (typeof raw.risk_score === 'number' ? raw.risk_score : 0);
      const riskLevel = raw.riskLevel || (score >= 80 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW');
      const actionTaken = raw.actionTaken || raw.action_taken || null;
      const flags = Array.isArray(raw.flags) ? raw.flags : [];
      const createdAtDate = raw.createdAt || raw.created_at ? new Date(raw.createdAt || raw.created_at) : new Date();

      setScan({
        id: raw.id,
        riskScore: score,
        riskLevel,
        actionTaken,
        flags,
        inputText: raw.inputText || raw.input_text || '',
        redactedText: raw.redactedText || raw.redacted_text || '',
        createdAt: createdAtDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch (err) {
      console.error('Failed to load scan details:', err);
      // Backend convention: 404 for not found / forbidden ownership
      if (err.status === 404) {
        setErrorMessage('Scan record not found or you do not have permission to view it.');
      } else if (err.status === 401) {
        setErrorMessage('Your session has expired. Please sign in again.');
      } else {
        setErrorMessage(err.message || 'Unable to load scan details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadScan();
  }, [loadScan]);

  // Copy protected content
  const handleCopyProtected = () => {
    if (!scan) return;
    const textToCopy = scan.redactedText || scan.inputText;
    navigator.clipboard.writeText(textToCopy);
    setCopiedProtected(true);
    showToast('Protected version copied to clipboard', 'success');
    setTimeout(() => setCopiedProtected(false), 2000);
  };

  // Execute real PATCH /api/scans/:id/action
  const handleSaveAction = async (actionValue) => {
    if (!scan || isSavingAction) return;

    setIsSavingAction(true);
    setActionError(null);

    try {
      const res = await api.scans.updateAction(scan.id, actionValue);
      const updated = res.scan || res.data;

      // Update local state with real returned record
      const updatedAction = updated?.actionTaken || updated?.action_taken || actionValue;
      setScan((prev) => (prev ? { ...prev, actionTaken: updatedAction } : null));
      setIsEditingAction(false);

      // Appropriate user-facing confirmation state (Section 10, 11, 12)
      if (actionValue === 'USE_REDACTED') {
        showToast('Protected version selected', 'success');
      } else if (actionValue === 'SEND_ANYWAY') {
        showToast('Marked as Send Anyway', 'warning');
      } else if (actionValue === 'DISCARD') {
        showToast('Scan marked as discarded', 'info');
      }

      // Synchronize AppContext history so History and Dashboard update immediately
      if (fetchScans) {
        fetchScans();
      }
    } catch (err) {
      console.error('Failed to persist action:', err);
      // Strictly do not show fake success states (Section 19)
      setActionError('Unable to save your action. Please try again.');
      showToast('Unable to save your action. Please try again.', 'error');
    } finally {
      setIsSavingAction(false);
    }
  };

  // Loading State (Section 20)
  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white border border-[#E5E7EB] rounded-xl text-xs text-[#6B7280] shadow-xs">
        <Clock className="w-6 h-6 mx-auto mb-2 text-[#2563EB] animate-spin" />
        <span className="font-medium text-[#111827]">Loading verified audit record...</span>
        <p className="text-[11px] text-[#9CA3AF] mt-1">Retrieving scan data securely from database</p>
      </div>
    );
  }

  // Error State / Not Found (Section 2 & 19)
  if (errorMessage || !scan) {
    return (
      <div className="p-10 text-center bg-white border border-[#E5E7EB] rounded-xl shadow-xs max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
        <h3 className="text-base font-semibold text-[#111827]">Scan not found</h3>
        <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
          {errorMessage || 'The requested audit record does not exist or access was denied.'}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button size="sm" variant="outline" onClick={() => navigate('/app/history')}>
            Back to History
          </Button>
          <Button size="sm" variant="primary" onClick={loadScan}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Action status mapping
  const actionTaken = scan.actionTaken;
  const isActionTaken = Boolean(actionTaken && !isEditingAction);

  // Format verified findings for display
  const findingsList = (scan.flags || []).map((f, i) => {
    let catKey = 'privacy';
    let catLabel = 'PII';
    const catUpper = (f.category || '').toUpperCase();
    if (catUpper === 'CREDENTIAL') {
      catKey = 'credential';
      catLabel = 'Credential';
    } else if (catUpper === 'FINANCIAL') {
      catKey = 'financial';
      catLabel = 'Financial';
    } else if (catUpper === 'SOCIAL_ENGINEERING') {
      catKey = 'socialEngineering';
      catLabel = 'Social Engineering';
    } else if (catUpper === 'PII') {
      catKey = 'privacy';
      catLabel = 'PII';
    }

    return {
      id: `flag-${i + 1}`,
      type: f.category || catLabel,
      category: catKey,
      categoryLabel: catLabel,
      severity: catUpper === 'CREDENTIAL' || catUpper === 'FINANCIAL' ? 'High' : 'Medium',
      text: f.span || '',
      explanation: f.reason || 'Flagged sensitive item.',
    };
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/app/history')}
            className="text-xs font-medium text-[#6B7280] hover:text-[#111827] flex items-center gap-1.5 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to History</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
            Scan Details
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
            <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>{scan.createdAt}</span>
            <span>•</span>
            <span className="font-mono text-[#4B5563]">ID: {scan.id}</span>
          </div>
        </div>

        {/* Top Copy & Refresh Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={copiedProtected ? Check : Copy}
            onClick={handleCopyProtected}
            className={`cursor-pointer ${copiedProtected ? 'text-[#16A34A] border-[#BBF7D0]' : ''}`}
          >
            {copiedProtected ? 'Copied' : 'Copy Protected Content'}
          </Button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs text-[#991B1B]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] font-medium text-[#991B1B] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 3: SECURITY CHECK */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              Security Check
            </h3>
          </div>

          {/* Current Decision Badge */}
          {actionTaken ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7280]">Action Taken:</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                  actionTaken === 'USE_REDACTED' || actionTaken === 'protected'
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                    : actionTaken === 'SEND_ANYWAY' || actionTaken === 'sent_anyway'
                    ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                    : 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
                }`}
              >
                {actionTaken === 'USE_REDACTED' || actionTaken === 'protected'
                  ? '✓ Use Redacted'
                  : actionTaken === 'SEND_ANYWAY' || actionTaken === 'sent_anyway'
                  ? '⚠️ Send Anyway'
                  : '✕ Discarded'}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-md font-medium border border-[#FDE68A]">
              Pending Decision
            </span>
          )}
        </div>

        {/* Score & Risk Level Metric */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <span className="text-xs text-[#6B7280] font-medium">Risk Score</span>
            <div className="text-2xl font-bold text-[#111827] mt-1">
              {scan.riskScore} <span className="text-sm font-normal text-[#6B7280]">/ 100</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    scan.riskScore >= 70
                      ? 'bg-[#DC2626]'
                      : scan.riskScore >= 40
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#16A34A]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, scan.riskScore))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <span className="text-xs text-[#6B7280] font-medium">Risk Level</span>
            <div className="mt-1 flex items-center gap-2">
              <RiskBadge level={scan.riskLevel} score={scan.riskScore} size="lg" />
            </div>
            <span className="text-[11px] text-[#6B7280] mt-2 block">
              {scan.riskLevel === 'CRITICAL' || scan.riskLevel === 'HIGH'
                ? 'Severe threats detected. Dispatch unsafe without remediation.'
                : scan.riskLevel === 'MEDIUM'
                ? 'Moderate threats identified. Review recommended.'
                : 'Minimal risk detected. Clean content.'}
            </span>
          </div>

          <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] sm:col-span-2 lg:col-span-1">
            <span className="text-xs text-[#6B7280] font-medium">Verified Findings</span>
            <div className="text-2xl font-bold text-[#111827] mt-1 font-mono">
              {scan.flags.length}
            </div>
            <span className="text-[11px] text-[#6B7280] mt-2 block">
              {scan.flags.length === 0
                ? 'Zero vulnerabilities detected.'
                : `${scan.flags.length} exact match token${scan.flags.length === 1 ? '' : 's'} flagged.`}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: WHY THIS IS RISKY */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Why This Is Risky</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">
          {getRiskExplanation(scan.flags, scan.riskScore)}
        </p>
      </div>

      {/* SECTION 3: DETECTED INFORMATION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Detected Information ({scan.flags.length})
          </h3>
          <span className="text-[11px] text-[#6B7280]">
            Exact span verification confirmed
          </span>
        </div>

        {findingsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {findingsList.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white border border-[#E5E7EB] rounded-xl text-center text-xs text-[#6B7280] shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
            <span className="font-medium text-[#111827]">No risks detected</span>
            <p className="text-[11px] text-[#6B7280] mt-1">
              No sensitive identifiers, authentication tokens, or social engineering signals were found.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 3 & 11: PROTECTED VERSION */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534]">
              Protected Version
            </h3>
            <span className="text-[10px] bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded font-medium border border-[#BBF7D0]">
              Safe to share
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={copiedProtected ? Check : Copy}
            onClick={handleCopyProtected}
            className={copiedProtected ? 'text-[#16A34A] border-[#BBF7D0]' : ''}
          >
            {copiedProtected ? 'Copied to Clipboard' : 'Copy Protected Content'}
          </Button>
        </div>

        <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#BBF7D0] min-h-[120px] max-h-[300px] overflow-y-auto">
          <div className="whitespace-pre-wrap font-sans text-xs text-[#111827] leading-relaxed select-all">
            {scan.redactedText || scan.inputText || 'No content available.'}
          </div>
        </div>

        <p className="text-[11px] text-[#6B7280]">
          Verified redaction tokens applied to all detected sensitive spans.
        </p>
      </div>

      {/* SECTION 3: ORIGINAL CONTENT (Privacy-preserving disclosure) */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              Original Content
            </span>
            <span className="text-[10px] bg-[#F3F4F6] text-[#4B5563] px-2 py-0.5 rounded font-medium">
              Privacy Masked
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-xs text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 font-medium cursor-pointer"
          >
            {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showOriginal ? 'Hide Original' : 'View Original'}</span>
          </button>
        </div>

        {showOriginal ? (
          <div className="mt-3 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] min-h-[100px] max-h-[300px] overflow-y-auto">
            <div className="whitespace-pre-wrap font-sans text-xs text-[#111827] leading-relaxed">
              {scan.inputText || 'No original input recorded.'}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            Raw unredacted text is masked to prevent accidental visual exposure. Click "View Original" above to inspect.
          </p>
        )}
      </div>

      {/* SECTION 4, 9, 10, 11, 12, 13, 14: ACTION WORKFLOW */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs">
        {isActionTaken ? (
          /* Persisted Action Display (Section 14) */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {actionTaken === 'USE_REDACTED' || actionTaken === 'protected' ? (
                  <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                ) : actionTaken === 'SEND_ANYWAY' || actionTaken === 'sent_anyway' ? (
                  <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                ) : (
                  <Trash2 className="w-5 h-5 text-[#6B7280]" />
                )}
                <h3 className="text-sm font-semibold text-[#111827]">
                  {actionTaken === 'USE_REDACTED' || actionTaken === 'protected'
                    ? 'Protected Version Selected'
                    : actionTaken === 'SEND_ANYWAY' || actionTaken === 'sent_anyway'
                    ? 'Marked as Send Anyway'
                    : 'Marked as Discarded'}
                </h3>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">
                {actionTaken === 'USE_REDACTED' || actionTaken === 'protected'
                  ? 'The protected version was chosen. You can safely copy and share the redacted content.'
                  : actionTaken === 'SEND_ANYWAY' || actionTaken === 'sent_anyway'
                  ? 'Audit log recorded that you chose to proceed unredacted despite security warnings.'
                  : 'This check was marked as discarded in your audit trail.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(actionTaken === 'USE_REDACTED' || actionTaken === 'protected') && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={copiedProtected ? Check : Copy}
                  onClick={handleCopyProtected}
                  className="font-medium cursor-pointer"
                >
                  {copiedProtected ? 'Copied' : 'Copy Redacted'}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingAction(true)}
                className="cursor-pointer text-xs"
              >
                Change Decision
              </Button>
            </div>
          </div>
        ) : (
          /* Interactive Action Controls (Section 4 & 14) */
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111827]">
                  What would you like to do?
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Select an action to record your decision. Your choice will be persisted to your security audit log.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. DISCARD (Section 12) */}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  disabled={isSavingAction}
                  onClick={() => setShowDiscardModal(true)}
                  className="text-[#6B7280] hover:text-[#DC2626] cursor-pointer"
                >
                  Discard
                </Button>

                {/* 2. SEND ANYWAY (Section 10) */}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Send}
                  disabled={isSavingAction}
                  onClick={() => setShowSendModal(true)}
                  className="cursor-pointer text-[#B45309] border-[#FDE68A] hover:bg-[#FEF3C7]"
                >
                  Send Anyway
                </Button>

                {/* 3. USE REDACTED (Section 11) */}
                <Button
                  variant="primary"
                  size="md"
                  icon={ShieldCheck}
                  disabled={isSavingAction}
                  isLoading={isSavingAction}
                  onClick={() => handleSaveAction('USE_REDACTED')}
                  className="font-medium shadow-xs cursor-pointer"
                >
                  {isSavingAction ? 'Saving...' : 'Use Redacted'}
                </Button>
              </div>
            </div>

            {/* Cancel edit button if user was changing decision */}
            {isEditingAction && (
              <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingAction(false)}
                  className="text-xs text-[#6B7280] hover:text-[#111827] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for SEND_ANYWAY (Section 13) */}
      <ConfirmationModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onConfirm={() => handleSaveAction('SEND_ANYWAY')}
        title="Mark as Send Anyway?"
        message="Some security risks were detected. Are you sure you want to mark this as Send Anyway? This will record in your audit log that you chose to proceed unredacted."
        confirmText="Confirm Send Anyway"
        confirmVariant="danger"
        icon={AlertTriangle}
      />

      {/* Confirmation Modal for DISCARD (Section 13) */}
      <ConfirmationModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={() => handleSaveAction('DISCARD')}
        title="Discard Security Check?"
        message="Are you sure you want to mark this check as discarded in your audit log? The scan record will be retained for audit trail integrity."
        confirmText="Confirm Discard"
        confirmVariant="danger"
        icon={Trash2}
      />
    </div>
  );
}
