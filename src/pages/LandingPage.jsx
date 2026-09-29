import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Eye,
  FileCheck,
  History,
  Check,
  CheckCircle2,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';

export function LandingPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewProtected, setPreviewProtected] = useState(false);

  // Canonical checkpoint entry handler
  const handleOpenCheckpoint = () => {
    if (user?.isAuthenticated) {
      navigate('/app/analyze');
    } else {
      navigate('/login?redirect=/app/analyze');
    }
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 antialiased">
      {/* 1. NAVBAR (68–72px height, 1180–1240px max width) */}
      <header className="h-[70px] border-b border-[#E5E7EB] bg-white sticky top-0 z-40">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* LEFT: TrustGuard Logo -> / */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#111827]">
              TrustGuard
            </span>
          </Link>

          {/* CENTER: Navigation Links (Smooth-scrolls) */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#667085]">
            <a
              href="#product"
              onClick={(e) => scrollToSection(e, 'product')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              Security
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              About
            </a>
          </nav>

          {/* RIGHT: Action Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-[13px] font-medium text-[#667085] hover:text-[#111827] px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenCheckpoint}
              className="text-xs px-3.5 py-1.5 font-medium rounded-md shadow-xs cursor-pointer"
            >
              Open Checkpoint &rarr;
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-[#667085] hover:text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E5E7EB] bg-white px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm text-[#4B5563]">
              <a
                href="#product"
                onClick={(e) => scrollToSection(e, 'product')}
                className="py-1.5 px-2 hover:bg-[#F9FAFB] rounded"
              >
                Product
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="py-1.5 px-2 hover:bg-[#F9FAFB] rounded"
              >
                How It Works
              </a>
              <a
                href="#security"
                onClick={(e) => scrollToSection(e, 'security')}
                className="py-1.5 px-2 hover:bg-[#F9FAFB] rounded"
              >
                Security
              </a>
              <a
                href="#about"
                onClick={(e) => scrollToSection(e, 'about')}
                className="py-1.5 px-2 hover:bg-[#F9FAFB] rounded"
              >
                About
              </a>
            </nav>
            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
              <Link
                to="/login"
                className="text-xs font-medium text-[#4B5563]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenCheckpoint();
                }}
              >
                Open Checkpoint &rarr;
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2 & 4. HERO SECTION (Split Editorial/Product Hero: Left ~48%, Right ~52%) */}
      <section
        id="product"
        className="pt-[72px] pb-[88px] max-w-[1220px] mx-auto px-4 sm:px-6 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* HERO LEFT SIDE */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              AI SECURITY &amp; PRIVACY
            </div>

            {/* Main Heading */}
            <h1 className="text-[40px] sm:text-[52px] lg:text-[56px] font-bold text-[#111827] tracking-tight leading-[1.08] mb-5">
              Know what you're sharing{' '}
              <span className="text-[#2563EB] underline decoration-[#BFDBFE] decoration-2 underline-offset-4">
                before you send it.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-[15px] sm:text-[16px] text-[#667085] leading-relaxed max-w-[520px] mb-7">
              TrustGuard checks your messages, documents and AI prompts for sensitive information
              and social-engineering risks — then shows you exactly what needs attention.
            </p>

            {/* CTA Buttons: Start a Security Check -> /app/analyze & How It Works -> #how-it-works */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Button
                size="md"
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleOpenCheckpoint}
                className="text-xs sm:text-sm px-5 py-2.5 font-medium rounded-md shadow-xs cursor-pointer"
              >
                Start a Security Check &rarr;
              </Button>
              <Button
                size="md"
                variant="outline"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-xs sm:text-sm px-4 py-2.5 font-medium rounded-md cursor-pointer text-[#4B5563] hover:text-[#111827]"
              >
                How It Works
              </Button>
            </div>

            {/* Trust Statement */}
            <div className="text-[12px] text-[#9CA3AF] tracking-tight flex items-center gap-2">
              <span>Private by design</span>
              <span className="text-gray-300">·</span>
              <span>Transparent findings</span>
              <span className="text-gray-300">·</span>
              <span>User-controlled actions</span>
            </div>
          </div>

          {/* HERO RIGHT SIDE — INTERACTIVE PRODUCT PREVIEW DEMO */}
          <div className="lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-[560px] bg-white border border-[#E5E7EB] rounded-[14px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden">
              {/* Top Bar with Demo Identifier */}
              <div className="px-5 py-3.5 bg-white border-b border-[#E5E7EB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="font-semibold text-[#111827] text-xs">TrustGuard Checkpoint</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                  <span className="text-[#6B7280] font-medium bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    Example security check · Product preview
                  </span>
                  <span className="flex items-center gap-1 font-medium text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    Interactive Demo
                  </span>
                </div>
              </div>

              {/* Input Preview Box */}
              <div className="p-5 border-b border-[#F3F4F6] bg-white">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#9CA3AF] tracking-wider uppercase mb-2">
                  <span>MESSAGE</span>
                  <span className="font-normal font-mono text-[10px] text-[#9CA3AF]">
                    {previewProtected ? 'Protected Preview' : 'Raw Input'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-xs text-[#111827] leading-relaxed font-sans">
                  {previewProtected ? (
                    <div>
                      <p className="text-[#667085]">Hi Rahul,</p>
                      <p className="mt-2 text-[#111827]">
                        Please send the payment of{' '}
                        <span className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-1.5 py-0.5 rounded font-mono text-[11px]">
                          [FINANCIAL INFORMATION REDACTED]
                        </span>{' '}
                        to the account below.
                      </p>
                      <p className="mt-2 text-[#111827]">
                        My Aadhaar number is{' '}
                        <span className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-1.5 py-0.5 rounded font-mono text-[11px]">
                          [GOVERNMENT ID REDACTED]
                        </span>
                        .
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#667085]">Hi Rahul,</p>
                      <p className="mt-2 text-[#111827]">
                        Please send the payment of{' '}
                        <span className="bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-1.5 py-0.5 rounded font-semibold font-mono text-[11px]">
                          ₹48,500
                        </span>{' '}
                        to the account below.
                      </p>
                      <p className="mt-2 text-[#111827]">
                        My Aadhaar number is{' '}
                        <span className="bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] px-1.5 py-0.5 rounded font-semibold font-mono text-[11px]">
                          XXXXXXXX1234
                        </span>
                        .
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Result Inside Card */}
              <div className="p-5 bg-white border-b border-[#F3F4F6]">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[#F3F4F6]">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-[#9CA3AF]">
                      SECURITY ANALYSIS
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-[#DC2626]">HIGH RISK</span>
                      <span className="text-[11px] text-[#667085]">· 3 issues detected</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-[#111827]">72</span>
                    <span className="text-xs text-[#9CA3AF]"> / 100</span>
                  </div>
                </div>

                {/* Three Compact Findings */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F9FAFB] transition-colors text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                        <Lock className="w-3 h-3" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-[#111827]">Privacy</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span className="text-[#667085]">Government ID detected</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded shrink-0 border border-[#FECACA]">
                      High
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F9FAFB] transition-colors text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-[#111827]">Financial</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span className="text-[#667085]">Payment information detected</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 rounded shrink-0 border border-[#FDE68A]">
                      Medium
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F9FAFB] transition-colors text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded bg-[#FAF5FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-3 h-3" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-[#111827]">Social Engineering</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span className="text-[#667085]">Urgency detected</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#7C3AED] bg-[#FAF5FF] px-1.5 py-0.5 rounded shrink-0 border border-[#E9D5FF]">
                      Medium
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. VIEW PROTECTED VERSION: Local UI Toggle only */}
              <div className="px-5 py-3.5 bg-[#F9FAFB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="text-[11px] text-[#4B5563] truncate">
                    {previewProtected
                      ? 'Displaying protected version'
                      : 'Protected version ready with 3 redactions'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewProtected(!previewProtected)}
                  className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer shrink-0 ml-3"
                >
                  {previewProtected ? 'View raw message ←' : 'View protected version →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP BELOW HERO */}
      <section className="border-y border-[#E5E7EB] bg-[#F8F9FA] py-8">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-5 text-center sm:text-left">
            BUILT AROUND FOUR PRINCIPLES
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-white border border-[#E5E7EB] flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Detect</h4>
                <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">
                  Sensitive information and suspicious signals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-white border border-[#E5E7EB] flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Explain</h4>
                <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">
                  Understand exactly why something was flagged.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-white border border-[#E5E7EB] flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Protect</h4>
                <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">
                  Generate a safer version of your content.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-white border border-[#E5E7EB] flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Prove</h4>
                <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">
                  Keep a transparent record of what happened.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (#how-it-works) */}
      <section id="how-it-works" className="py-20 max-w-[1220px] mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-xl mb-12">
          <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#111827] leading-tight">
            One checkpoint before your content leaves your control.
          </h2>
          <p className="text-sm sm:text-base text-[#667085] mt-2">
            TrustGuard turns a potentially risky message into an informed decision.
          </p>
        </div>

        {/* Four Horizontal Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono font-semibold text-[#2563EB] mb-2">01</div>
              <h3 className="text-sm font-bold text-[#111827]">Analyze</h3>
              <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                Paste your content or upload a document before dispatching.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[11px] text-[#9CA3AF] flex items-center justify-between">
              <span>Text or Document</span>
              <span className="text-[#2563EB] font-mono">&rarr;</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono font-semibold text-[#2563EB] mb-2">02</div>
              <h3 className="text-sm font-bold text-[#111827]">Detect</h3>
              <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                Find sensitive information, credentials, and suspicious signals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[11px] text-[#9CA3AF] flex items-center justify-between">
              <span>Exact Span Matching</span>
              <span className="text-[#2563EB] font-mono">&rarr;</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono font-semibold text-[#2563EB] mb-2">03</div>
              <h3 className="text-sm font-bold text-[#111827]">Protect</h3>
              <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                Create a safer redacted version that preserves original readability.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[11px] text-[#9CA3AF] flex items-center justify-between">
              <span>Deterministic Masking</span>
              <span className="text-[#2563EB] font-mono">&rarr;</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono font-semibold text-[#2563EB] mb-2">04</div>
              <h3 className="text-sm font-bold text-[#111827]">Decide</h3>
              <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                Review findings and choose whether to send protected, continue, or discard.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[11px] text-[#9CA3AF] flex items-center justify-between">
              <span>Audit Logged</span>
              <span className="text-[#16A34A] font-mono">✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY ANALYSIS SECTION (#security) */}
      <section
        id="security"
        className="py-20 bg-[#F8F9FA] border-y border-[#E5E7EB]"
      >
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* LEFT: Text */}
            <div className="lg:col-span-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] mb-3">
                TRANSPARENT INSPECTION
              </div>
              <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#111827] leading-tight mb-4">
                Security findings you can actually understand.
              </h2>
              <p className="text-sm sm:text-base text-[#667085] leading-relaxed mb-6">
                TrustGuard doesn't hide the reasoning behind a risk score. Every finding points to
                the exact content that triggered it and explains why it matters.
              </p>
              <div className="space-y-3 text-xs text-[#4B5563]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Exact character-level spans highlighted in context</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Contextual threat rationale tailored to each vulnerability</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Verified location badges for audit reliability</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Findings Cards */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Detected issue
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#111827]">Government ID</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.2 rounded border border-[#FECACA]">
                        Privacy
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                    <MapPin className="w-2.5 h-2.5" />
                    Location verified
                  </span>
                </div>

                <div className="my-2 p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-mono text-[#991B1B]">
                  "XXXXXXXX1234"
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#F3F4F6]">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#9CA3AF] mb-0.5">
                    Why this matters
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    This appears to be a sensitive government identifier that should not be shared
                    without a clear need and cryptographic masking.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Detected issue
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#111827]">Urgency signal</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] font-semibold text-[#7C3AED] bg-[#FAF5FF] px-2 py-0.2 rounded border border-[#E9D5FF]">
                        Social Engineering
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                    <MapPin className="w-2.5 h-2.5" />
                    Location verified
                  </span>
                </div>

                <div className="my-2 p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-mono text-[#7C3AED]">
                  "Please transfer the money immediately"
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#F3F4F6]">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#9CA3AF] mb-0.5">
                    Why this matters
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Potential pressure around a financial action, a common precursor pattern in
                    business email compromise and wire fraud.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FROM EXPOSED TO PROTECTED SECTION */}
      <section className="py-20 max-w-[1220px] mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#111827]">
            From exposed to protected.
          </h2>
          <p className="text-sm sm:text-base text-[#667085] mt-2">
            Generate a safer version without rewriting the entire message yourself.
          </p>
        </div>

        {/* Split Comparison Box */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB]">
            {/* Before */}
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F3F4F6]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                  Before (Exposed)
                </span>
                <span className="text-[11px] text-[#9CA3AF] font-mono">Raw Text</span>
              </div>
              <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] text-xs font-mono text-[#111827] leading-relaxed min-h-[140px]">
                Hi Vikram,<br /><br />
                My Aadhaar number is <span className="bg-[#FEE2E2] text-[#991B1B] px-1 rounded font-semibold border border-[#FECACA]">4829-1920-1234</span>.<br />
                Please send <span className="bg-[#FFFBEB] text-[#92400E] px-1 rounded font-semibold border border-[#FDE68A]">₹48,500</span> to account 928102938192 immediately.
              </div>
            </div>

            {/* Protected */}
            <div className="p-6 bg-[#FAFAFA]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                  Protected (Safe to Send)
                </span>
                <span className="text-[11px] text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded font-medium border border-[#BBF7D0]">
                  Ready
                </span>
              </div>
              <div className="p-4 bg-white rounded-lg border border-[#BBF7D0] text-xs font-mono text-[#111827] leading-relaxed min-h-[140px]">
                Hi Vikram,<br /><br />
                My Aadhaar number is <span className="bg-[#EFF6FF] text-[#1E40AF] px-1 rounded font-semibold border border-[#BFDBFE]">[GOVERNMENT ID REDACTED]</span>.<br />
                Please send <span className="bg-[#EFF6FF] text-[#1E40AF] px-1 rounded font-semibold border border-[#BFDBFE]">[FINANCIAL INFORMATION REDACTED]</span> to account [REDACTED] immediately.
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#667085]">
              Clean inline replacements preserve readability and context for third-party recipients and AI models.
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenCheckpoint}
              className="text-xs shrink-0 cursor-pointer"
            >
              Open Checkpoint &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* PRIVACY / TRUST SECTION (#about) */}
      <section id="about" className="py-20 bg-[#F8F9FA] border-y border-[#E5E7EB]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#111827]">
              Security should be understandable.
            </h2>
            <p className="text-sm text-[#667085] mt-2">
              Three foundational guarantees behind every TrustGuard analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
                <Eye className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-[#111827] mb-1.5">Transparent</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Every finding is connected to the exact content that triggered it. You never have to guess what an opaque AI flag refers to.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
                <Lock className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-[#111827] mb-1.5">Controlled</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                You decide whether to use the protected version, continue unredacted, or discard. TrustGuard advises; you govern.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
                <History className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-[#111827] mb-1.5">Traceable</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Your security history records what was detected and what action you took, giving you verifiable proof of due diligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6">
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Before you send it, run a checkpoint.
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-2 max-w-md mx-auto">
              Know what you're sharing. Understand the risk. Protect what matters.
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                size="md"
                variant="primary"
                onClick={handleOpenCheckpoint}
                className="text-xs sm:text-sm px-6 py-2.5 font-medium rounded-md shadow-xs cursor-pointer"
              >
                Open TrustGuard &rarr;
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[#E5E7EB] bg-white py-10">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#667085]">
          {/* LEFT: Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Shield className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="font-bold text-[#111827]">TrustGuard</span>
            <span className="text-[#9CA3AF]">·</span>
            <span>Your last security check before you send.</span>
          </div>

          {/* RIGHT: Links */}
          <div className="flex items-center gap-5 text-xs text-[#667085]">
            <a
              href="#product"
              onClick={(e) => scrollToSection(e, 'product')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              Security
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-[#111827] transition-colors cursor-pointer"
            >
              About
            </a>
            <Link to="/login" className="hover:text-[#111827] transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        {/* BOTTOM: Copyright */}
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 mt-6 pt-4 border-t border-[#F3F4F6] text-center sm:text-left text-[11px] text-[#9CA3AF]">
          &copy; 2026 TrustGuard AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
