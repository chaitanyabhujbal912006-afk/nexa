"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Mail, Lock, KeyRound, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";
import { KineticBackground } from "@/components/KineticBackground";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.sendOtp(email.trim());
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(email.trim(), otpCode.trim());
      setAuthToken(res.access_token);
      localStorage.setItem("nexa_user_email", email.trim());
      router.push("/initializing");
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(email.trim(), "123456");
      setAuthToken(res.access_token);
      localStorage.setItem("nexa_user_email", email.trim());
      router.push("/initializing");
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0c1324] text-[#dce1fb] relative overflow-hidden p-4">
      <KineticBackground />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-[#424754] shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="p-3 rounded-xl bg-gradient-to-br from-[#adc6ff]/20 to-[#4cd7f6]/20 border border-[#adc6ff]/30 text-[#adc6ff] shadow-lg mb-2">
            <BrainCircuit className="w-8 h-8" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Access Nexa Vault</h1>
          <p className="text-xs text-[#c2c6d6]">Obsidian Kinetic Enterprise Authentication</p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#151b2d] rounded-xl border border-[#424754] text-xs font-mono">
          <button
            onClick={() => { setAuthMode("otp"); setStep("email"); setError(null); }}
            className={`py-2 rounded-lg transition-all ${authMode === "otp" ? "bg-[#4d8eff] text-white font-semibold shadow-md" : "text-[#c2c6d6] hover:text-white"}`}
          >
            Email OTP
          </button>
          <button
            onClick={() => { setAuthMode("password"); setError(null); }}
            className={`py-2 rounded-lg transition-all ${authMode === "password" ? "bg-[#4d8eff] text-white font-semibold shadow-md" : "text-[#c2c6d6] hover:text-white"}`}
          >
            Password
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs font-mono">
            {error}
          </div>
        )}

        {/* OTP Flow */}
        {authMode === "otp" && (
          step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#c2c6d6] mb-1">ENTERPRISE EMAIL</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#adc6ff] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] placeholder-slate-500 focus:outline-none focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Send 6-Digit Verification Code</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#191f31] border border-[#424754] text-xs font-mono flex items-center justify-between">
                <span className="text-[#c2c6d6]">{email}</span>
                <button type="button" onClick={() => setStep("email")} className="text-[#adc6ff] hover:underline text-[10px]">
                  Change
                </button>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c2c6d6] mb-1">6-DIGIT OTP CODE</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#adc6ff] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-[#adc6ff]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Test Code: 123456</span>
              </div>
              <button
                type="submit"
                disabled={loading || !otpCode.trim()}
                className="w-full py-3 rounded-xl bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Verify & Access Vault</span>
              </button>
            </form>
          )
        )}

        {/* Password Flow */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#c2c6d6] mb-1">ENTERPRISE EMAIL</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#adc6ff] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] placeholder-slate-500 focus:outline-none focus:border-[#adc6ff]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-[#c2c6d6] mb-1">PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#adc6ff] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] placeholder-slate-500 focus:outline-none focus:border-[#adc6ff]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-3 rounded-xl bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Sign In</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#c2c6d6]">
            Don't have an enterprise vault?{" "}
            <Link href="/signup" className="text-[#adc6ff] hover:underline font-medium">
              Register Workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
