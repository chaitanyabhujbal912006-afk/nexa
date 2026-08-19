import React from 'react';
import { playTactileClick } from '../utils/audio';
import { Network, GitCompare, ShieldCheck } from 'lucide-react';

const SPRITE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNhOLk9-MIVodJWSbI2PP4piLRg_VVzdosOCZ6yllVQhY22YgzkiNuYhY4j4thxJnVq44SR0CQkt1GRlpd8F-ee63Fv1lCT9Tp07t_fsjlLZ9YQJxAT-xgFL_AP09cDtmXG6lrZPp6RQJYVIwWHtAI_pQtB5BSQerjLtje8N3ZorYECOVIgHFL4mF6emono_454Qe8x2o-kzYSfIR5742_oYf7GjcInUI4-qViGkisOidRx64m-hQk';

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  spriteLeft: string;
  moduleCode: string;
  accentColor: string;
}

export const FeatureGrid: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      id: 'feature-multi-source',
      title: 'Multi-source Intelligence',
      description:
        'Connect structured SQL and unstructured PDFs, emails, and wikis seamlessly across your enterprise perimeter.',
      spriteLeft: '0%',
      moduleCode: 'MOD-01 // INGESTION',
      accentColor: '#bef264',
    },
    {
      id: 'feature-conflict-detection',
      title: 'Conflict Detection',
      description:
        'Automatically cross-reference timestamped clauses to detect contradicting policies before decisions are executed.',
      spriteLeft: '-100%',
      moduleCode: 'MOD-02 // ARBITRATION',
      accentColor: '#c084fc',
    },
    {
      id: 'feature-cited-answers',
      title: 'Cited Answers',
      description:
        'Every single generated assertion links directly to cryptographic document hashes and verbatim page clauses.',
      spriteLeft: '-200%',
      moduleCode: 'MOD-03 // EVIDENCE',
      accentColor: '#38bdf8',
    },
  ];

  return (
    <section id="features-grid" className="grid md:grid-cols-3 gap-6 lg:gap-8 w-full pt-4">
      {features.map((feat) => (
        <div
          key={feat.id}
          id={feat.id}
          onMouseEnter={playTactileClick}
          className="apple-glass-card p-8 rounded-[32px] flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(190,242,100,0.15)] hover:border-white/40 group cursor-default border border-white/15"
        >
          {/* Module Index Code */}
          <span className="font-mono text-[10px] font-bold text-[#94a3b8] group-hover:text-white transition-colors tracking-widest uppercase">
            {feat.moduleCode}
          </span>

          {/* Animated Sprite Container with Glass Refraction */}
          <div className="w-32 h-32 overflow-hidden relative rounded-2xl flex items-center justify-center bg-[#060a14] border border-white/10 group-hover:border-white/30 transition-all shadow-inner group-hover:scale-105">
            <img
              alt={feat.title}
              src={SPRITE_URL}
              className="absolute max-w-none h-full object-cover transition-transform duration-500"
              style={{
                left: feat.spriteLeft,
                width: '300%',
              }}
            />
          </div>

          <div className="flex flex-col gap-2 overflow-visible">
            <h3 className="font-syne text-xl sm:text-2xl font-extrabold text-[#f8fafc] tracking-tight group-hover:text-[#bef264] transition-colors">
              {feat.title}
            </h3>
            <p className="font-sans text-sm text-[#cbd5e1] leading-relaxed">
              {feat.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};
