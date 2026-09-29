import React, { useState } from 'react';
import { ShieldCheck, Send, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ConfirmationModal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

export function ActionPanel({ onActionDecided, issuesCount = 0 }) {
  const { recordDecision } = useApp();
  const [showSendWarningModal, setShowSendWarningModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const handleUseProtected = () => {
    recordDecision('USE_REDACTED');
    if (onActionDecided) onActionDecided('USE_REDACTED');
  };

  const handleConfirmSendAnyway = () => {
    recordDecision('SEND_ANYWAY');
    if (onActionDecided) onActionDecided('SEND_ANYWAY');
  };

  const handleConfirmDiscard = () => {
    recordDecision('DISCARD');
    if (onActionDecided) onActionDecided('DISCARD');
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">What would you like to do?</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            TrustGuard provides remediation guidance, but you retain full authority over your data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Discard */}
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setShowDiscardModal(true)}
            className="text-[#6B7280] hover:text-[#DC2626]"
          >
            Discard
          </Button>

          {/* Send Anyway */}
          <Button
            variant="outline"
            size="sm"
            icon={Send}
            onClick={() => setShowSendWarningModal(true)}
          >
            Send Anyway
          </Button>

          {/* Use Protected Version */}
          <Button
            variant="primary"
            size="md"
            icon={ShieldCheck}
            onClick={handleUseProtected}
            className="font-medium shadow-xs"
          >
            Use Protected Version
          </Button>
        </div>
      </div>

      {/* Confirmation Modal before Send Anyway */}
      <ConfirmationModal
        isOpen={showSendWarningModal}
        onClose={() => setShowSendWarningModal(false)}
        onConfirm={handleConfirmSendAnyway}
        title="Send Content Without Redaction?"
        message={`Your text contains ${issuesCount} detected security/privacy findings. Sending this content without redaction may expose sensitive identifiers, credentials, or financial details to third parties or untrusted recipients. Are you sure you wish to proceed?`}
        confirmText="Yes, Send Unredacted"
        confirmVariant="danger"
        icon={AlertTriangle}
      />

      {/* Confirmation Modal before Discard */}
      <ConfirmationModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={handleConfirmDiscard}
        title="Discard Security Analysis?"
        message="This will clear your draft text and discard the current analysis session. This action cannot be undone."
        confirmText="Discard Analysis"
        confirmVariant="danger"
        icon={Trash2}
      />
    </div>
  );
}
