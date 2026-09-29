import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';

export function SignupPage() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    const result = await signup(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(redirect, { replace: true });
    } else {
      setErrorMessage(result.error || 'Unable to register account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl w-full mx-auto bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: Security message */}
        <div className="p-8 sm:p-10 bg-[#FAFAFA] border-b md:border-b-0 md:border-r border-[#E5E7EB] flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-8 group inline-flex">
              <div className="w-8 h-8 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-base font-bold text-[#111827]">TrustGuard AI</span>
            </Link>

            <h2 className="text-lg font-bold text-[#111827] tracking-tight">
              A private guardian for every dispatch.
            </h2>
            <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
              Equip your workflow with an intelligent security filter that pinpoints secrets, PII, and financial threats prior to submission.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-[#4B5563]">
                <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Private local memory with exportable audit logs</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#4B5563]">
                <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Deterministic redaction tailored for AI prompts</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#4B5563]">
                <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Zero text retention by default on all private analyses</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E5E7EB] text-[11px] text-[#9CA3AF]">
            Compliant with SOC2 and ISO/IEC 27001 data isolation requirements.
          </div>
        </div>

        {/* Right: Real Registration form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">Create your TrustGuard account</h1>
            <p className="text-xs text-[#6B7280] mt-1">Add a security checkpoint before your content leaves your control.</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md flex items-center gap-2 text-xs text-[#991B1B]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Work email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-md bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-md bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-md bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                placeholder="Repeat password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full justify-center text-xs py-2.5 mt-2 cursor-pointer"
            >
              Create account
            </Button>

            <p className="text-[11px] text-[#6B7280] leading-relaxed pt-1">
              Your security checks are scoped exclusively to your authenticated identity.
            </p>

            <div className="text-center pt-2 border-t border-[#F3F4F6]">
              <span className="text-xs text-[#6B7280]">Already have an account? </span>
              <Link
                to={`/login${redirect !== '/app/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-xs text-[#2563EB] font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
