import React from 'react';
import { ShieldCheck, Cpu, Database, Zap, Lock, Globe, Server, Check } from 'lucide-react';
import { playTactileClick } from '../utils/audio';

export const ArchitectureSection: React.FC = () => {
  const specs = [
    {
      icon: Lock,
      title: 'Zero-Trust Encryption',
      desc: 'AES-256 at rest & TLS 1.3 in transit with client-managed KMS partition keys.',
      metric: 'FIPS 140-2',
      color: '#bef264',
    },
    {
      icon: Zap,
      title: 'Sub-200ms Latency',
      desc: 'HNSW vector graph index paired with neural multi-source cross-encoders.',
      metric: '<184ms P99',
      color: '#38bdf8',
    },
    {
      icon: ShieldCheck,
      title: 'SOC2 Type II Certified',
      desc: 'Continuous cryptographic compliance logging and automated RBAC enforcement.',
      metric: 'AUDITED 2025',
      color: '#c084fc',
    },
    {
      icon: Globe,
      title: 'Isolated Cluster Deploy',
      desc: 'Dedicated single-tenant VPC containment with 99.99% multi-region SLA.',
      metric: '99.99% SLA',
      color: '#4ade80',
    },
  ];

  return (
    <section id="architecture-section" className="w-full flex flex-col items-center gap-10 pt-12">
      {/* Title with Cursive Accent (Zero Font Clipping) */}
      <div className="text-center flex flex-col gap-2 max-w-3xl px-4 overflow-visible">
        <span className="font-cursive text-3xl sm:text-4xl text-[#38bdf8] font-bold mb-0.5 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] overflow-visible">
          Enterprise Cluster Architecture
        </span>
        <h2 className="font-syne text-3xl sm:text-5xl lg:text-[56px] lg:leading-[64px] font-extrabold text-[#f8fafc] tracking-[-0.035em] overflow-visible pb-1">
          Powerful intelligence infrastructure
        </h2>
        <p className="font-sans text-base text-[#cbd5e1] leading-relaxed max-w-xl">
          Engineered for strict corporate governance, air-gapped security, and real-time cross-enterprise arbitration.
        </p>
      </div>

      {/* Main Architecture Graphic Card */}
      <div className="w-full relative rounded-[32px] overflow-hidden apple-glass-card p-3 sm:p-4 shadow-2xl group border border-white/20 hover:border-white/40 transition-all duration-500">
        <div className="w-full rounded-[24px] overflow-hidden relative bg-[#080d1a] border border-white/10">
          <img
            alt="Architecture Dashboard"
            className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-700 opacity-95"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyoBehoEIIRcvlVD1UEvomFGFXYn5Me8SDKRPoh0guA9dHj3G1eAosfR3W18KA3MyY2Lu_3lC2CLkfvfh-WIhbP9dQX_elvUTDFHyaniTA2Rw_9NpMDq7L55yZfRhUl2hO3dgP6xTGbXF5QmOi_SAROGUsNhkFMwliRpyxOTj_sdeSeXOmG7qN8Y0cfcN2S-DaPJhn-eqa9kuUZ8AXgPDdy26UaOjnhfE1GPzfcFSBgMKmLi1g40eQ"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060913]/90 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {specs.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              onMouseEnter={playTactileClick}
              className="apple-glass-pill p-6 rounded-2xl flex flex-col justify-between gap-4 border border-white/15 hover:border-white/30 hover:-translate-y-1.5 transition-all duration-300 shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${s.color}20`, color: s.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold text-[#cbd5e1] bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  {s.metric}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 overflow-visible">
                <h3 className="font-syne text-lg font-bold text-white group-hover:text-[#bef264] transition-colors">
                  {s.title}
                </h3>
                <p className="font-sans text-xs text-[#94a3b8] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
