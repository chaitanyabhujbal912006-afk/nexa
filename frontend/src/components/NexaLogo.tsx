import React from 'react';

interface NexaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const NexaLogo: React.FC<NexaLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* NEXA Stylized Bold Extended Lettermark */}
      <div className="flex items-center">
        <span
          className={`font-syne font-black tracking-wider text-white uppercase transition-all ${
            isSm
              ? 'text-base sm:text-lg tracking-[0.14em]'
              : isLg
              ? 'text-3xl sm:text-4xl tracking-[0.18em]'
              : 'text-lg sm:text-xl tracking-[0.16em]'
          }`}
          style={{
            transform: 'scaleY(0.92)',
            display: 'inline-block',
          }}
        >
          NEXA
        </span>
      </div>

      {/* Official Vertical Divider Line & Stacked Kernel Label */}
      {showSubtitle && (
        <div className="flex items-center gap-2 sm:gap-2.5 border-l border-[#38bdf8]/40 pl-2 sm:pl-2.5 py-0.5">
          <div
            className={`flex flex-col font-mono font-bold uppercase text-[#94a3b8] tracking-[0.18em] leading-[1.05] ${
              isSm
                ? 'text-[7px]'
                : isLg
                ? 'text-[11px]'
                : 'text-[8.5px] sm:text-[9px]'
            }`}
          >
            <span className="text-[#cbd5e1]">KNOWLEDGE</span>
            <span className="text-[#94a3b8]">INTELLIGENCE</span>
            <span className="text-[#64748b]">KERNEL</span>
          </div>
        </div>
      )}
    </div>
  );
};
