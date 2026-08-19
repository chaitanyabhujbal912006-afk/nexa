import React from 'react';
import { Layers, AlertOctagon, CheckCircle, ArrowUpRight } from 'lucide-react';

interface FeaturesGridProps {
  onSelectFeature?: (feature: string) => void;
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onSelectFeature }) => {
  const spriteUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCNhOLk9-MIVodJWSbI2PP4piLRg_VVzdosOCZ6yllVQhY22YgzkiNuYhY4j4thxJnVq44SR0CQkt1GRlpd8F-ee63Fv1lCT9Tp07t_fsjlLZ9YQJxAT-xgFL_AP09cDtmXG6lrZPp6RQJYVIwWHtAI_pQtB5BSQerjLtje8N3ZorYECOVIgHFL4mF6emono_454Qe8x2o-kzYSfIR5742_oYf7GjcInUI4-qViGkisOidRx64m-hQk';

  const features = [
    {
      id: 'multi-source',
      title: 'Multi-source Synthesis',
      description: 'Connect structured and unstructured datasets across enterprise silos with zero telemetry leakage.',
      tag: '01 / SYNTHESIS',
      offset: '0%',
      targetId: '#knowledge-everywhere',
    },
    {
      id: 'conflict-detection',
      title: 'Temporal Conflict Detection',
      description: 'Automatically isolate, chronologically order, and resolve contradictions across historical repositories.',
      tag: '02 / ARBITRATION',
      offset: '-100%',
      targetId: '#conflict-detection-section',
    },
    {
      id: 'cited-answers',
      title: 'Cryptographic Provenance',
      description: 'Every synthesized output is backed by verifiable document citations and timestamped paragraph hashes.',
      tag: '03 / PROVENANCE',
      offset: '-200%',
      targetId: '#citation-evidence-section',
    },
  ];

  const handleCardClick = (targetId: string) => {
    const el = document.querySelector(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="intelligence-core" className="grid md:grid-cols-3 gap-6 lg:gap-8 w-full pt-4">
      {features.map((item) => (
        <div
          key={item.id}
          id={`feature-card-${item.id}`}
          onClick={() => handleCardClick(item.targetId)}
          className="bg-[#121212] border border-[#262626] p-8 sm:p-10 flex flex-col items-start gap-8 hover:border-[#404040] transition-all duration-300 group cursor-pointer shadow-2xl relative"
        >
          {/* Top Plate Tag */}
          <div className="w-full flex items-center justify-between border-b border-[#262626] pb-4">
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#737373] font-sans">
              {item.tag}
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#525252] group-hover:text-white transition-colors" />
          </div>

          {/* Visual container with sprite offset */}
          <div className="w-full h-36 overflow-hidden relative border border-[#262626] bg-[#0A0A0A] flex items-center justify-center">
            <img
              alt={item.title}
              className="absolute h-full w-[300%] max-w-none object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-500"
              style={{ left: item.offset }}
              src={spriteUrl}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Text in Refined Typography */}
          <div className="space-y-3">
            <h3 className="text-2xl font-serif text-white group-hover:text-[#D4D4D4] transition-colors">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed font-light">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};
