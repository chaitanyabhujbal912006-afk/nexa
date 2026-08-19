import React, { useState, useRef } from 'react';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Zap, Database, GitMerge } from 'lucide-react';
import { UserSession } from '../types';
import { playTactileClick, playResolvedChime } from '../utils/audio';
import { sendOtp, verifyOtp, saveLocalProfile, loadLocalProfile } from '../api/auth';
import type { ApiError } from '../api/client';

interface AuthSignInProps {
  onSignInSuccess: (session: UserSession) => void;
  onSwitchToSignUp: () => void;
  onBackToLanding: () => void;
}

export const AuthSignIn: React.FC<AuthSignInProps> = ({
  onSignInSuccess,
  onSwitchToSignUp,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Step 1 — Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    playTactileClick();
    try {
      await sendOtp(trimmedEmail);
      setStep('otp');
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMsg(apiErr.message ?? 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — Verify OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    playTactileClick();
    try {
      const result = await verifyOtp(email.trim().toLowerCase(), code);
      const profile = loadLocalProfile();
      playResolvedChime();
      onSignInSuccess({
        userId: result.user_id,
        email: result.email,
        fullName: profile.fullName || result.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: profile.role || 'Member',
        company: profile.company || '',
        isLoggedIn: true,
      });
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMsg(apiErr.message ?? 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP digit input handler with auto-advance and paste support
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste: distribute digits across all boxes
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...otpCode];
      digits.forEach((d, i) => { if (index + i < 6) newCode[index + i] = d; });
      setOtpCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }
    const newCode = [...otpCode];
    newCode[index] = value.replace(/\D/g, '');
    setOtpCode(newCode);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOAuthLogin = (provider: 'Google Workspace' | 'GitHub Enterprise') => {
    // OAuth SSO not yet connected to backend — show info message
    setErrorMsg(`${provider} SSO is not yet configured. Please use Email OTP to sign in.`);
  };

  return (
    <div id="signin-screen" className="min-h-screen w-full flex relative overflow-hidden bg-[#06040e] text-[#f8fafc] font-sans">
      {/* Background Planetary Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1400px] h-[550px] rounded-full bg-[#7c3aed]/20 blur-[140px] pointer-events-none" />

      {/* Return to Platform */}
      <button
        id="signin-back-btn"
        onClick={() => {
          playTactileClick();
          onBackToLanding();
        }}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#94a3b8] hover:text-white apple-glass-pill px-4 py-2 rounded-full border border-white/15 transition-all cursor-pointer shadow-lg"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Platform</span>
      </button>

      <div className="flex flex-col lg:flex-row h-full w-full relative z-10 min-h-screen">
        {/* Left Branding Area (OrbitSat/NEXA Cosmic Theme) */}
        <div className="hidden lg:flex flex-col justify-between w-[50%] p-12 lg:p-16 relative overflow-hidden">
          <div className="z-10 mt-8">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                <div className="w-full h-full bg-[#0d0a1c] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#c084fc] fill-current" />
                </div>
              </div>
              <span className="font-display font-extrabold text-2xl text-white tracking-wider">
                NEXA <span className="text-[#a855f7] font-mono text-xs">VPC GATEWAY</span>
              </span>
            </div>
          </div>

          <div className="z-10 flex flex-col justify-center flex-grow py-6">
            <span className="font-mono text-xs uppercase font-bold text-[#c084fc] tracking-widest mb-3">
              ENTERPRISE ACCESS GATEWAY
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-extrabold text-white max-w-2xl leading-tight mb-6">
              All your enterprise
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e9d5ff] to-[#c084fc]">
                knowledge, verified in real time.
              </span>
            </h1>

            <div className="relative w-full max-w-lg rounded-[28px] overflow-hidden apple-glass-card p-4 border border-white/15 shadow-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-white font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#c084fc]" /> ZERO-TRUST AIR-GAPPED VPC
                </span>
                <span className="text-[#4ade80] text-[10px]">OPERATIONAL</span>
              </div>
              <p className="text-[#94a3b8] font-sans text-xs">
                Real-time SHA-256 policy arbitration and neural vector synthesis across connected Google Drive, Notion, and Slack repositories.
              </p>
            </div>
          </div>

          {/* Bottom Security Tags */}
          <div className="z-10 flex items-center space-x-6 text-[#94a3b8] font-mono text-xs uppercase tracking-wider border-t border-white/10 pt-6 w-max">
            <span className="flex items-center gap-1.5 font-bold text-[#c084fc]">
              <Database className="w-4 h-4 text-[#c084fc]" /> Multi-Source
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5 font-bold text-[#38bdf8]">
              <GitMerge className="w-4 h-4 text-[#38bdf8]" /> Conflict-Aware
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5 font-bold text-[#4ade80]">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" /> 99.8% Grounded
            </span>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-10 lg:p-16 relative">
          <div className="w-full max-w-md apple-glass-card rounded-[32px] p-8 lg:p-10 relative z-20 border border-white/15 shadow-2xl my-auto">
            <div className="mb-7">
              <span className="font-mono text-xs uppercase font-bold text-[#c084fc] tracking-wider block mb-1">
                {step === 'email' ? 'WELCOME BACK' : 'VERIFY IDENTITY'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {step === 'email' ? 'Sign In to Instance' : 'Enter Verification Code'}
              </h2>
              <p className="font-sans text-xs text-[#94a3b8] mt-1">
                {step === 'email'
                  ? 'Enter your work email to receive a secure access code.'
                  : <span>A 6-digit code was sent to <strong className="text-white">{email}</strong></span>}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#fca5a5] text-xs font-mono flex items-center gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'email' ? (
              <>
                {/* SSO Buttons (UI-only — OAuth not yet configured in backend) */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('Google Workspace')}
                    className="apple-glass-pill py-2.5 px-3 rounded-xl text-xs font-sans font-semibold text-white/90 hover:text-white hover:border-[#a855f7]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Google SSO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('GitHub Enterprise')}
                    className="apple-glass-pill py-2.5 px-3 rounded-xl text-xs font-sans font-semibold text-white/90 hover:text-white hover:border-[#c084fc]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>GitHub SSO</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center mb-6">
                  <div className="border-t border-white/10 w-full" />
                  <span className="font-mono text-[10px] text-[#94a3b8] bg-[#0c081e] px-3 uppercase tracking-widest absolute">
                    Or with email code
                  </span>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] font-bold mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                        required
                        placeholder="architect@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-sm placeholder:text-white/30 focus:outline-none focus:border-[#a855f7] transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer btn-orbitsat-purple mt-2"
                  >
                    {isLoading ? <span>Sending Code...</span> : <><span>Send Verification Code</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* 6-box OTP input */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] font-bold mb-3">
                    Verification Code
                  </label>
                  <div className="flex gap-2 justify-between">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        aria-label={`Digit ${idx + 1} of 6`}
                        className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-[#a855f7] transition-all"
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-[#94a3b8] mt-2">
                    Demo mode: use code <strong className="text-[#c084fc]">123456</strong>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer btn-orbitsat-purple"
                >
                  {isLoading ? <span>Authenticating VPC...</span> : <><span>Enter Workspace</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtpCode(['','','','','','']); setErrorMsg(''); }}
                  className="w-full text-center font-sans text-xs text-[#94a3b8] hover:text-white transition-all cursor-pointer"
                >
                  ← Use a different email
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="font-sans text-xs text-[#94a3b8]">
                Need a new isolated tenant cluster?{' '}
                <button
                  onClick={() => {
                    playTactileClick();
                    onSwitchToSignUp();
                  }}
                  className="text-[#c084fc] font-bold hover:underline cursor-pointer"
                >
                  Create Organization
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
