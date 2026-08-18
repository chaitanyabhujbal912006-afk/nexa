"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Mail, Building, User, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";
import { KineticBackground } from "@/components/KineticBackground";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(email.trim(), "123456");
      setAuthToken(res.access_token);
      localStorage.setItem("nexa_user_email", email.trim());
      localStorage.setItem("nexa_user_name", fullName.trim());
      localStorage.setItem("nexa_org_name", organization.trim());
      router.push("/initializing");
    } catch (err: any) {
      setError(err.message || "Failed to initialize workspace registration.");
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
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Register Enterprise Vault</h1>
          <p className="text-xs text-[#c2c6d6]">Initialize your isolated Nexa Intelligence workspace</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#93000a]/30 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#c2c6d6] mb-1">FULL NAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#adc6ff] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] placeholder-slate-500 focus:outline-none focus:border-[#adc6ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c2c6d6] mb-1">ENTERPRISE EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#adc6ff] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] placeholder-slate-500 focus:outline-none focus:border-[#adc6ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c2c6d6] mb-1">ORGANIZATION / VAULT NAME</label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#adc6ff] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Acme Corp / Household Vault"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] placeholder-slate-500 focus:outline-none focus:border-[#adc6ff]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 rounded-xl bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Create Isolated Intelligence Vault</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#c2c6d6]">
            Already have an enterprise vault?{" "}
            <Link href="/login" className="text-[#adc6ff] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
