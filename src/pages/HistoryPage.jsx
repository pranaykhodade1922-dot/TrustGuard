import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, ChevronRight, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/Tabs';
import { useApp } from '../context/AppContext';

export function HistoryPage() {
  const { history, isLoadingScans, scansError, fetchScans } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE'

  const filteredHistory = history.filter((item) => {
    // Search match
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(query) ||
      item.snippet?.toLowerCase().includes(query) ||
      item.action?.toLowerCase().includes(query);

    // Filter match
    if (!matchesSearch) return false;
    if (riskFilter === 'ALL') return true;
    if (riskFilter === 'HIGH') return item.risk === 'High';
    if (riskFilter === 'MEDIUM') return item.risk === 'Medium';
    if (riskFilter === 'LOW') return item.risk === 'Low';
    if (riskFilter === 'SAFE') return item.risk === 'Safe';
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
            Security History
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Review your previous content checks and actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={fetchScans}
            disabled={isLoadingScans}
            className="text-xs cursor-pointer"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {scansError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 flex items-center justify-between gap-3 text-xs text-[#991B1B]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>Unable to load your security history: {scansError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={fetchScans}
            className="text-xs cursor-pointer border-[#FECACA] text-[#991B1B] hover:bg-[#FEE2E2]"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scans..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#D1D5DB] rounded-md bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB]"
          />
        </div>

        {/* Risk Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'HIGH', label: 'High Risk' },
            { id: 'MEDIUM', label: 'Medium Risk' },
            { id: 'LOW', label: 'Low Risk' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRiskFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                riskFilter === tab.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#111827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoadingScans ? (
        <Card noPadding>
          <div className="p-12 text-center text-xs text-[#6B7280]">
            <Clock className="w-6 h-6 mx-auto mb-2 text-[#9CA3AF] animate-spin" />
            <span>Loading security checks from database...</span>
          </div>
        </Card>
      ) : filteredHistory.length > 0 ? (
        /* History Table */
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-3 text-center">Findings</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredHistory.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => navigate(`/app/scan/${scan.id}`)}
                    className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-[#6B7280] whitespace-nowrap">
                      <div className="font-medium text-[#111827]">{scan.date}</div>
                      <div className="text-[10px] text-[#9CA3AF]">{scan.fullDate || 'Verified'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#111827] max-w-sm">
                      <div className="font-semibold text-xs truncate">{scan.title}</div>
                      <div className="text-[11px] text-[#6B7280] truncate mt-0.5">{scan.snippet}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <RiskBadge level={scan.risk} score={scan.riskScore} size="sm" />
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-[#4B5563]">
                      {scan.findingsCount}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block text-[11px] px-2 py-0.5 rounded font-medium border ${
                          scan.action === 'Use Redacted' || scan.action === 'Protected' || scan.actionRaw === 'USE_REDACTED'
                            ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                            : scan.action === 'Send Anyway' || scan.actionRaw === 'SEND_ANYWAY'
                            ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                            : scan.action === 'Discarded' || scan.actionRaw === 'DISCARD'
                            ? 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
                            : 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                        }`}
                      >
                        {scan.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-[#6B7280]">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Genuine Database Empty State (Section 9 & 16) */
        <EmptyState
          icon={Shield}
          title={searchQuery || riskFilter !== 'ALL' ? 'No matching scans' : 'No scans yet'}
          description={
            searchQuery || riskFilter !== 'ALL'
              ? 'Try adjusting your search criteria or risk filter.'
              : 'Your security checks will appear here.'
          }
          actionText="Start a Security Check"
          onAction={() => navigate('/app/analyze')}
        />
      )}
    </div>
  );
}
