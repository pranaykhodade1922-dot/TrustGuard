import React from 'react';
import { Menu, ShieldCheck, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export function Topbar({ setMobileOpen }) {
  const { user } = useApp();
  const location = useLocation();

  const getPageMeta = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      return { title: 'Dashboard', sub: 'Security operations overview' };
    }
    if (path.includes('/analyze')) {
      return { title: 'Security Checkpoint', sub: 'Pre-dispatch inspection and redaction' };
    }
    if (path.includes('/history')) {
      return { title: 'Security History', sub: 'Audit logs and past scans' };
    }
    if (path.includes('/settings')) {
      return { title: 'Settings', sub: 'Security parameters and policy configurations' };
    }
    if (path.includes('/scan/')) {
      return { title: 'Scan Details', sub: 'Comprehensive security audit report' };
    }
    return { title: 'TrustGuard AI', sub: 'Security Checkpoint' };
  };

  const meta = getPageMeta();

  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-md text-[#4B5563] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb / Page Heading */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-semibold text-[#111827]">{meta.title}</h1>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="text-[11px] text-[#6B7280] hidden sm:inline">{meta.sub}</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Active Protection Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-full text-[11px] text-[#166534] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Active Guard</span>
        </div>

        {/* Fast Action */}
        <Link to="/app/analyze">
          <Button size="sm" variant="primary" icon={Plus}>
            Analyze
          </Button>
        </Link>

        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-xs font-semibold text-[#374151]">
          {user?.avatar || 'U'}
        </div>
      </div>
    </header>
  );
}
