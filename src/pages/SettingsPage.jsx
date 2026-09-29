import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Download, Save, User, Calendar, LogOut } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useApp } from '../context/AppContext';

export function SettingsPage() {
  const { settings, setSettings, history, showToast, user, logout } = useApp();
  const navigate = useNavigate();

  const handleExportAuditTrail = () => {
    if (history.length === 0) {
      showToast('No scan history records available to export', 'info');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trustguard-audit-log-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Audit trail exported successfully', 'success');
  };

  const handleSave = () => {
    showToast('Settings saved successfully', 'success');
  };

  const formattedCreatedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Active Session';

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
          Settings &amp; Security Policy
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
          Configure inspection sensitivity, redaction formatting, and account preferences.
        </p>
      </div>

      {/* Account Session & Authentication (Section 17 & 18: Real User Details) */}
      <Card title="Account Profile" subtitle="Authenticated identity and session information">
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
              <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Account Email</span>
              </div>
              <div className="font-semibold text-sm text-[#111827]">
                {user?.email || 'Authenticated User'}
              </div>
            </div>

            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
              <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Account Created</span>
              </div>
              <div className="font-semibold text-sm text-[#111827]">
                {formattedCreatedDate}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between">
            <span className="text-[#6B7280] text-[11px]">
              Session token verified via JWT Bearer authentication.
            </span>
            <Button
              size="sm"
              variant="outline"
              icon={LogOut}
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="cursor-pointer text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Redaction Formatting Card */}
      <Card title="Redaction Formatting" subtitle="Control how masked sensitive tokens appear in protected outputs">
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#374151] block mb-1.5">Redaction Token Style</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'bracket', title: 'Descriptive Brackets', example: '[GOVERNMENT ID REDACTED]' },
                { id: 'asterisk', title: 'Standard Masking', example: '••••••••1234' },
                { id: 'block', title: 'Solid Blackout Block', example: '████████████' },
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSettings({ ...settings, redactionStyle: style.id })}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    settings.redactionStyle === style.id
                      ? 'border-[#2563EB] bg-[#EFF6FF]/40 text-[#111827] ring-1 ring-[#2563EB]/20'
                      : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="font-semibold text-xs">{style.title}</div>
                  <div className="font-mono text-[11px] text-[#6B7280] mt-1 p-1 bg-white border border-[#E5E7EB] rounded">
                    {style.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#111827]">Auto-copy on protection</span>
              <p className="text-[11px] text-[#6B7280]">Automatically copy protected text when selecting 'Use Protected Version'</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoCopyProtected}
              onChange={(e) => setSettings({ ...settings, autoCopyProtected: e.target.checked })}
              className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Detection Sensitivity */}
      <Card title="Detection Thresholds" subtitle="Tune risk sensitivity for automated warnings">
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#374151] block mb-1">Warning Threshold</label>
            <p className="text-[11px] text-[#6B7280] mb-2">Display high-visibility warning dialogue when scan score meets or exceeds:</p>
            <select
              value={settings.riskThreshold}
              onChange={(e) => setSettings({ ...settings, riskThreshold: e.target.value })}
              className="w-full sm:w-64 px-3 py-1.5 border border-[#D1D5DB] rounded-md bg-white text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="Low">Low Risk (Score &gt; 20)</option>
              <option value="Medium">Medium Risk (Score &gt; 40) - Recommended</option>
              <option value="High">High Risk (Score &gt; 70)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#111827]">Zero-Retention Enforced</span>
              <p className="text-[11px] text-[#6B7280]">Original plaintext is kept solely in local volatile session memory</p>
            </div>
            <span className="text-[10px] font-semibold bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded border border-[#BBF7D0]">
              Active
            </span>
          </div>
        </div>
      </Card>

      {/* Audit Export & Governance */}
      <Card title="Compliance &amp; Export" subtitle="Download verified audit logs for compliance reviews">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-[#111827]">Export Audit History</span>
            <p className="text-[11px] text-[#6B7280]">
              Download verified JSON containing timestamps, risk scores, and audit actions.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={Download}
            onClick={handleExportAuditTrail}
            disabled={history.length === 0}
          >
            Export JSON ({history.length} {history.length === 1 ? 'record' : 'records'})
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="md" variant="primary" icon={Save} onClick={handleSave}>
          Save Policy Preferences
        </Button>
      </div>
    </div>
  );
}
