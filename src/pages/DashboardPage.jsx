import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShieldCheck, ShieldAlert, ChevronRight, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { Card } from '../components/common/Card';
import { useApp } from '../context/AppContext';

export function DashboardPage() {
  const { user, history, isLoadingScans, scansError, fetchScans } = useApp();
  const navigate = useNavigate();

  // 1. Calculate Real Metrics Strictly from Authenticated User's Scans (PRD Section 16)
  const totalScans = history.length;
  const highRiskChecks = history.filter((h) => h.risk === 'High' || h.risk === 'CRITICAL' || (h.riskScore || 0) >= 55).length;
  const protectedScans = history.filter((h) => h.action === 'Use Redacted' || h.action === 'Protected' || h.actionRaw === 'USE_REDACTED').length;
  const discardedScans = history.filter((h) => h.action === 'Discarded' || h.actionRaw === 'DISCARD').length;

  // Average Risk: Calculated strictly from real database records. If zero scans, display '—'
  const avgRisk = totalScans > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.riskScore || 0), 0) / totalScans)
    : '—';

  // 2. Derive Real Risk Trend Data strictly from user's authentic scans (Section 7)
  const chartData = React.useMemo(() => {
    if (history.length === 0) return [];

    // Group scans by date
    const dateMap = new Map();
    [...history].reverse().forEach((scan) => {
      const dateKey = scan.date || 'Today';
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { day: dateKey, totalScore: 0, count: 0 });
      }
      const entry = dateMap.get(dateKey);
      entry.totalScore += scan.riskScore || 0;
      entry.count += 1;
    });

    return Array.from(dateMap.values()).map((item) => ({
      day: item.day,
      avgRisk: Math.round(item.totalScore / item.count),
      scans: item.count,
    }));
  }, [history]);

  // Custom subtle tooltip for real chart data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2.5 border border-[#E5E7EB] rounded shadow-xs text-xs">
          <p className="font-semibold text-[#111827]">{label}</p>
          <p className="text-[#2563EB] mt-0.5">
            Avg. Risk: <span className="font-bold">{payload[0].value}</span> / 100
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Greeting Section & Primary CTA */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
            Welcome, {user?.name || user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Check your content before you send it. All security checks are private.
          </p>
        </div>

        <div>
          <Button
            size="lg"
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/app/analyze')}
            className="w-full sm:w-auto font-medium shadow-xs cursor-pointer"
          >
            Analyze New Content
          </Button>
        </div>
      </div>

      {/* Error State Banner (Section 24: No silent fallback to fake data) */}
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

      {/* Overview Metrics Row — Real Database Values (PRD Section 16) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-xs">
          <div className="text-xs font-semibold text-[#6B7280]">Total Checks</div>
          <div className="text-2xl font-bold text-[#111827] mt-1.5">
            {isLoadingScans ? '...' : totalScans}
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-0.5">
            {totalScans === 0 ? 'No checks yet' : 'In your account'}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-xs">
          <div className="text-xs font-semibold text-[#6B7280]">High Risk Checks</div>
          <div className="text-2xl font-bold text-[#DC2626] mt-1.5">
            {isLoadingScans ? '...' : highRiskChecks}
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-0.5">
            {highRiskChecks === 0 ? 'Zero critical issues' : 'Required remediation'}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-xs">
          <div className="text-xs font-semibold text-[#6B7280]">Protected Checks</div>
          <div className="text-2xl font-bold text-[#16A34A] mt-1.5">
            {isLoadingScans ? '...' : protectedScans}
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-0.5">
            {protectedScans === 0 ? 'None yet' : 'Protected before dispatch'}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-xs">
          <div className="text-xs font-semibold text-[#6B7280]">Discarded Checks</div>
          <div className="text-2xl font-bold text-[#4B5563] mt-1.5">
            {isLoadingScans ? '...' : discardedScans}
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-0.5">
            {discardedScans === 0 ? 'Zero discarded' : 'Logged in audit trail'}
          </div>
        </div>
      </div>

      {/* Grid: Recent Activity & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table (Section 6: Real Records or Genuine Empty State) */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Activity"
            subtitle="Completed security checks and audit decisions"
            headerAction={
              history.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/app/history')}
                  className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View all history</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )
            }
            noPadding
          >
            {isLoadingScans ? (
              <div className="p-8 text-center text-xs text-[#6B7280]">
                <Clock className="w-5 h-5 mx-auto mb-2 text-[#9CA3AF] animate-spin" />
                <span>Loading your security history...</span>
              </div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                      <th className="py-2.5 px-4">Content</th>
                      <th className="py-2.5 px-3">Risk</th>
                      <th className="py-2.5 px-3 text-center">Findings</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {history.slice(0, 5).map((scan) => (
                      <tr
                        key={scan.id}
                        onClick={() => navigate(`/app/scan/${scan.id}`)}
                        className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-[#111827] max-w-[200px]">
                          <div className="truncate font-semibold">{scan.title}</div>
                          <div className="truncate text-[11px] text-[#6B7280] mt-0.5">{scan.snippet}</div>
                        </td>
                        <td className="py-3 px-3">
                          <RiskBadge level={scan.risk} score={scan.riskScore} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[#4B5563]">
                          {scan.findingsCount}
                        </td>
                        <td className="py-3 px-3">
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
                        <td className="py-3 px-4 text-right text-[#6B7280] text-[11px] whitespace-nowrap">
                          {scan.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Genuine Empty State (Section 6 & 16) */
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-5 h-5 text-[#9CA3AF]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111827]">No recent activity</h4>
                  <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
                    Your completed security checks will appear here once you run your first analysis.
                  </p>
                </div>
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/app/analyze')}
                    className="cursor-pointer font-medium"
                  >
                    Analyze Content
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Risk Overview Chart (Section 7: Real scans or Genuine Empty State) */}
        <div>
          <Card
            title="Risk Overview"
            subtitle="Aggregate score trajectory from verified checks"
          >
            {chartData.length > 0 ? (
              <div className="h-[200px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="avgRisk"
                      stroke="#2563EB"
                      strokeWidth={1.75}
                      fillOpacity={1}
                      fill="url(#riskGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* Genuine Empty State (Section 7) */
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto">
                  <Clock className="w-4 h-4 text-[#9CA3AF]" />
                </div>
                <h4 className="text-xs font-semibold text-[#111827]">No risk history yet</h4>
                <p className="text-[11px] text-[#6B7280] max-w-xs mx-auto leading-relaxed">
                  Complete your first security check to see your risk trend.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                Average Risk Trend
              </span>
              <span className="font-semibold text-[#111827]">
                {totalScans > 0 ? `${avgRisk}/100 Baseline` : 'Awaiting checks'}
              </span>
            </div>
          </Card>

          {/* Safe Dispatch Checklist */}
          <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-xs">
            <h4 className="text-xs font-semibold text-[#111827] flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              Safe Dispatch Checklist
            </h4>
            <ul className="text-xs text-[#6B7280] space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-[#16A34A]">•</span>
                <span>Never paste live cloud secret keys into public AI prompts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#16A34A]">•</span>
                <span>Validate unexpected supplier banking change requests verbally.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#16A34A]">•</span>
                <span>Redact government IDs (Aadhaar, SSN) before sharing documents.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
