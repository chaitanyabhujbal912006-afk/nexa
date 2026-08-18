"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, CheckCircle2, RefreshCw, Layers, Lock, Cpu } from "lucide-react";
import { KineticBackground } from "@/components/KineticBackground";

export default function InitializingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Establishing encrypted session tokens...",
    "Mounting isolated ChromaDB vector index...",
    "Loading domain policy guidelines & conflict models...",
    "Connecting to Groq high-speed LLM inference engine...",
    "Nexa Intelligence Workspace Ready!",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => router.push("/dashboard"), 800);
          return 100;
        }
        const next = prev + 4;
        const stepIdx = Math.min(Math.floor((next / 100) * steps.length), steps.length - 1);
        setCurrentStep(stepIdx);
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0c1324] text-[#dce1fb] relative overflow-hidden p-4">
      <KineticBackground />

      <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-[#424754] shadow-2xl relative z-10 space-y-6">
        {/* Core Animated Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#adc6ff]/20 to-[#4cd7f6]/20 border border-[#adc6ff]/30 text-[#adc6ff] shadow-xl animate-pulse">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Initializing Nexa Vault</h1>
          <p className="text-xs text-[#c2c6d6]">Configuring multi-tenant vector pipeline & safety engines</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#adc6ff] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 animate-spin" /> {steps[currentStep]}
            </span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#151b2d] rounded-full overflow-hidden border border-[#424754]">
            <div
              className="h-full bg-gradient-to-r from-[#adc6ff] via-[#4d8eff] to-[#4cd7f6] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step checklist */}
        <div className="space-y-2.5 pt-2">
          {steps.slice(0, 4).map((s, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-3 transition-all ${
                currentStep > idx
                  ? "bg-[#191f31] border-[#4cd7f6]/40 text-[#4cd7f6]"
                  : currentStep === idx
                  ? "bg-[#23293c] border-[#adc6ff] text-white shadow-md shadow-indigo-500/10"
                  : "bg-[#070d1f]/50 border-[#424754]/50 text-slate-500"
              }`}
            >
              {currentStep > idx ? (
                <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] shrink-0" />
              ) : currentStep === idx ? (
                <RefreshCw className="w-4 h-4 text-[#adc6ff] animate-spin shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
