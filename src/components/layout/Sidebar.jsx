import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  SearchCode,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/analyze', label: 'Analyze', icon: SearchCode },
    { to: '/app/history', label: 'History', icon: History },
  ];

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[240px] bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Product Brand */}
          <div className="h-14 px-5 flex items-center gap-2.5 border-b border-[#F3F4F6]">
            <div className="w-8 h-8 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#111827] tracking-tight">TrustGuard</span>
              <span className="text-[10px] text-[#6B7280] font-medium leading-none">Security Checkpoint</span>
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="px-3 py-4">
            <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 mb-2">
              Workspace
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                          : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Settings & User Profile */}
        <div className="border-t border-[#F3F4F6] p-3 space-y-1">
          <NavLink
            to="/app/settings"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
              }`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Landing Page</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </NavLink>

          {/* User profile row */}
          <div className="pt-2 border-t border-[#F3F4F6] mt-2">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#F9FAFB] transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.avatar || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#111827] truncate">{user?.name || user?.email?.split('@')[0] || 'User'}</div>
                  <div className="text-[10px] text-[#6B7280] truncate">{user?.email || 'Authenticated Session'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[#9CA3AF] hover:text-[#DC2626] p-1 rounded hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
