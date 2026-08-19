import React, { useState, useRef } from 'react';
import { Mail, User, Building2, Briefcase, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Database, GitMerge } from 'lucide-react';
import { UserSession } from '../types';
import { playTactileClick, playResolvedChime } from '../utils/audio';
import { sendOtp, verifyOtp, saveLocalProfile } from '../api/auth';
import type { ApiError } from '../api/client';

interface AuthSignUpProps {
  onSignUpSuccess: (session: UserSession) => void;
  onSwitchToSignIn: () => void;
  onBackToLanding: () => void;
}

export const AuthSignUp: React.FC<AuthSignUpProps> = ({
  onSignUpSuccess,
  onSwitchToSignIn,
  onBackToLanding,
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'profile' | 'otp'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Step 1 — Validate profile fields and send OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !company) {
      setErrorMsg('Please fill in all required identity fields.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Please accept the data sovereignty and compliance terms.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    playTactileClick();
    try {
      // Save profile locally (backend only stores email/userId)
      saveLocalProfile({ fullName, role: role || 'Member', company });
      await sendOtp(email.trim().toLowerCase());
      setStep('otp');
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMsg(apiErr.message ?? 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 — Verify OTP and provision session
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
      playResolvedChime();
      onSignUpSuccess({
        userId: result.user_id,
        email: result.email,
        fullName: fullName,
        role: role || 'Member',
        company: company,
        isLoggedIn: true,
      });
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMsg(apiErr.message ?? 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handler
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
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

  const handleAutofillDemo = () => {
    playTactileClick();
    setFullName('Marcus Vance');
    setRole('Head of Compliance & Legal Ops');
    setEmail('marcus.vance@vanguard-holdings.com');
    setCompany('Vanguard Strategic Holdings');
    setAgreedToTerms(true);
  };

  return (
    <div id="signup-screen" className="min-h-screen w-full flex relative overflow-hidden bg-[#06040e] text-[#f8fafc] font-sans">
      {/* Background Planetary Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1400px] h-[550px] rounded-full bg-[#7c3aed]/20 blur-[140px] pointer-events-none" />

      {/* Return to Platform */}
      <button
        id="signup-back-btn"
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
        {/* Left Branding Area */}
        <div className="hidden lg:flex flex-col justify-between w-[48%] p-12 lg:p-16 relative overflow-hidden">
          <div className="z-10 mt-8">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                <div className="w-full h-full bg-[#0d0a1c] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#c084fc] fill-current" />
                </div>
              </div>
              <span className="font-display font-extrabold text-2xl text-white tracking-wider">
                NEXA <span className="text-[#a855f7] font-mono text-xs">VPC PROVISION</span>
              </span>
            </div>
          </div>

          <div className="z-10 flex flex-col justify-center flex-grow py-6">
            <span className="font-mono text-xs uppercase font-bold text-[#c084fc] tracking-widest mb-3">
              ISOLATED CLUSTER PROVISIONING
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-extrabold text-white max-w-2xl leading-tight mb-6">
              Initialize your dedicated
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e9d5ff] to-[#c084fc]">
                Knowledge Cluster.
              </span>
            </h1>

            <div className="space-y-4 max-w-md">
              <div className="apple-glass-pill p-4 rounded-2xl flex items-center gap-3 border border-white/15">
                <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center text-[#c084fc]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <strong className="text-white block">Dedicated VPC Enclave</strong>
                  <span className="text-[#94a3b8]">Single-tenant memory partitions with continuous KMS rotation.</span>
                </div>
              </div>

              <div className="apple-glass-pill p-4 rounded-2xl flex items-center gap-3 border border-white/15">
                <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <strong className="text-white block">Cryptographic Arbitration</strong>
                  <span className="text-[#94a3b8]">Automated policy contradiction overrides with immutable SHA-256 logs.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Compliance Tags */}
          <div className="z-10 flex items-center space-x-6 text-[#94a3b8] font-mono text-xs uppercase tracking-wider border-t border-white/10 pt-6 w-max">
            <span className="flex items-center gap-1.5 font-bold text-[#c084fc]">
              <Database className="w-4 h-4 text-[#c084fc]" /> SOC2 Air-Gapped
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5 font-bold text-[#4ade80]">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" /> 99.99% SLA
            </span>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="w-full lg:w-[52%] flex items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-y-auto">
          <div className="w-full max-w-lg apple-glass-card rounded-[32px] p-8 sm:p-10 relative z-20 border border-white/15 shadow-2xl my-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-mono text-xs uppercase font-bold text-[#c084fc] tracking-wider block mb-1">
                  NEW CLUSTER
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  Create Organization
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="font-mono text-[10px] text-[#c084fc] hover:text-white apple-glass-pill px-3 py-1.5 rounded-full border border-[#a855f7]/40 cursor-pointer"
              >
                Autofill Demo
              </button>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#fca5a5] text-xs font-mono flex items-center gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={step === 'profile' ? handleSubmit : handleVerifyOtp} className="space-y-4">
              {step === 'profile' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] font-bold mb-1">
                        Architect Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="Elena Rostova"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-xs placeholder:text-white/30 focus:outline-none focus:border-[#a855f7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] font-bold mb-1">
                        Enterprise Role
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="Chief Knowledge Architect"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-xs placeholder:text-white/30 focus:outline-none focus:border-[#a855f7]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] font-bold mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                          required
                          placeholder="elena@acme.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-xs placeholder:text-white/30 focus:outline-none focus:border-[#a855f7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] font-bold mb-1">
                        Organization Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          required
                          placeholder="Acme Global Systems"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-sans text-xs placeholder:text-white/30 focus:outline-none focus:border-[#a855f7]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer font-sans text-xs text-[#cbd5e1]">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded bg-white/10 border-white/20 text-[#a855f7] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span>
                        I confirm dedicated sovereign data storage and single-tenant vector clustering.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer btn-orbitsat-purple mt-2"
                  >
                    {isLoading ? (
                      <span>Sending Verification Code...</span>
                    ) : (
                      <><span>Provision Dedicated Instance</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </>
              ) : (
                /* OTP Verification Step */
                <>
                  <div>
                    <p className="font-sans text-xs text-[#94a3b8] mb-4">
                      A 6-digit code was sent to <strong className="text-white">{email}</strong>
                    </p>
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
                    {isLoading ? <span>Initializing Neural VPC...</span> : <><span>Activate Workspace</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('profile'); setOtpCode(['','','','','','']); setErrorMsg(''); }}
                    className="w-full text-center font-sans text-xs text-[#94a3b8] hover:text-white transition-all cursor-pointer"
                  >
                    ← Use a different email
                  </button>
                </>
              )}
            </form>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="font-sans text-xs text-[#94a3b8]">
                Already have an instance provisioned?{' '}
                <button
                  onClick={() => {
                    playTactileClick();
                    onSwitchToSignIn();
                  }}
                  className="text-[#c084fc] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
