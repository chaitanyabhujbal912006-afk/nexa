import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Maximize2, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';
import { ColorTheme } from '../types';

interface QuantumGraphCanvasProps {
  colorTheme: ColorTheme;
  onSelectNode?: (nodeName: string) => void;
  particleCount?: number;
}

interface Node {
  id: string;
  name: string;
  type: 'policy' | 'contract' | 'email' | 'database' | 'code' | 'core';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  citations: number;
  confidence: number;
}

export const QuantumGraphCanvas: React.FC<QuantumGraphCanvasProps> = ({
  colorTheme,
  onSelectNode,
  particleCount = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<Node | null>(null);
  const [isSimulatingPulse, setIsSimulatingPulse] = useState(true);

  // Theme primary colors for canvas
  const getThemePalette = () => {
    switch (colorTheme) {
      case 'quantum-violet':
        return { primary: '#c084fc', secondary: '#818cf8', accent: '#38bdf8', glow: 'rgba(192, 132, 252, 0.5)' };
      case 'solar-plasma':
        return { primary: '#f59e0b', secondary: '#ef4444', accent: '#ec4899', glow: 'rgba(245, 158, 11, 0.5)' };
      case 'matrix-emerald':
        return { primary: '#10b981', secondary: '#06b6d4', accent: '#84cc16', glow: 'rgba(16, 185, 129, 0.5)' };
      case 'cyber-neon':
      default:
        return { primary: '#00f0ff', secondary: '#9d00ff', accent: '#ff007f', glow: 'rgba(0, 240, 255, 0.5)' };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const palette = getThemePalette();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;

    // Nodes initial setup
    const nodes: Node[] = [
      { id: 'core', name: 'NEXA-QUANTUM-CORE', type: 'core', x: width / 2, y: height / 2, vx: 0, vy: 0, radius: 24, color: palette.primary, citations: 48, confidence: 99.4 },
      { id: 'n1', name: 'refund_policy_v2.pdf', type: 'policy', x: width * 0.28, y: height * 0.32, vx: 0.2, vy: 0.15, radius: 14, color: palette.primary, citations: 12, confidence: 97.8 },
      { id: 'n2', name: 'enterprise_terms.pdf', type: 'contract', x: width * 0.72, y: height * 0.28, vx: -0.15, vy: 0.2, radius: 15, color: palette.secondary, citations: 18, confidence: 98.6 },
      { id: 'n3', name: 'HR_Handbook_2021.pdf', type: 'policy', x: width * 0.22, y: height * 0.68, vx: 0.1, vy: -0.2, radius: 13, color: '#ff0055', citations: 4, confidence: 42.1 },
      { id: 'n4', name: 'Updated_Benefits_2024.docx', type: 'policy', x: width * 0.78, y: height * 0.72, vx: -0.18, vy: -0.12, radius: 15, color: palette.accent, citations: 15, confidence: 98.9 },
      { id: 'n5', name: 'CEO_Memo_Q3.eml', type: 'email', x: width * 0.5, y: height * 0.18, vx: 0.12, vy: 0.08, radius: 12, color: palette.secondary, citations: 8, confidence: 94.2 },
      { id: 'n6', name: 'Cluster_Telemetry.db', type: 'database', x: width * 0.5, y: height * 0.82, vx: -0.1, vy: -0.15, radius: 13, color: palette.primary, citations: 22, confidence: 99.1 },
    ];

    // Background floating micro-particles
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw animated background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Draw micro-particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.fillStyle = palette.primary;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 3. Update & render node connections with animated pulse rays
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nA = nodes[i];
          const nB = nodes[j];
          const dx = nB.x - nA.x;
          const dy = nB.y - nA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 260 || nA.id === 'core' || nB.id === 'core') {
            const alpha = Math.max(0.1, 1 - dist / 300);
            
            // Connection line
            ctx.strokeStyle = nA.id === 'n3' || nB.id === 'n3' ? 'rgba(255, 0, 85, 0.4)' : `${palette.glow}`;
            ctx.lineWidth = nA.id === 'core' || nB.id === 'core' ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.lineTo(nB.x, nB.y);
            ctx.stroke();

            // Animated traveling energy pulse packet
            if (isSimulatingPulse) {
              const pulsePos = (Math.sin(pulseTime * 2 + i * 2 + j) + 1) / 2;
              const px = nA.x + dx * pulsePos;
              const py = nA.y + dy * pulsePos;

              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = palette.primary;
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // 4. Update and render nodes
      nodes.forEach((node) => {
        if (node.id !== 'core') {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < node.radius + 10 || node.x > w - node.radius - 10) node.vx *= -1;
          if (node.y < node.radius + 10 || node.y > h - node.radius - 10) node.vy *= -1;
        }

        // Outer glow halo
        const gradient = ctx.createRadialGradient(node.x, node.y, node.radius * 0.3, node.x, node.y, node.radius * 2.2);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node main circle
        ctx.fillStyle = '#030712';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = node.color;
        ctx.lineWidth = node.id === 'core' ? 3 : 2;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner core point
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Node label
        ctx.font = '10px "Inter", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.radius + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Canvas click handler
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let found: Node | null = null;
      nodes.forEach((node) => {
        const dx = clickX - node.x;
        const dy = clickY - node.y;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 8) {
          found = node;
        }
      });

      if (found) {
        setSelectedNodeData(found);
        onSelectNode?.(found.name);
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
    };
  }, [colorTheme, isSimulatingPulse, particleCount]);

  return (
    <div className="w-full relative cyber-card rounded-2xl overflow-hidden p-2 sm:p-4 border border-[var(--theme-border)]">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--theme-border)] mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)] animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest text-[var(--theme-primary)] uppercase">
            Quantum Graph Topology v2.4
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <button
            onClick={() => setIsSimulatingPulse(!isSimulatingPulse)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-[var(--theme-primary)] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3 text-[var(--theme-primary)]" />
            <span>{isSimulatingPulse ? 'Pulse Active' : 'Pulse Paused'}</span>
          </button>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-cyan-950/60 text-cyan-300 rounded border border-cyan-800/60">
            7 Dynamic Clusters
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden bg-slate-950/80">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />

        {/* Selected Node Inspector Drawer Overlay */}
        {selectedNodeData && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 cyber-card p-4 rounded-xl shadow-2xl border border-[var(--theme-primary)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-primary)] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Node Inspector
              </span>
              <button
                onClick={() => setSelectedNodeData(null)}
                className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-bold text-white truncate mb-1">{selectedNodeData.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800 mt-2">
              <div>
                <span className="text-[9px] text-slate-500 block">CONFIDENCE</span>
                <span className="text-[var(--theme-primary)] font-bold">{selectedNodeData.confidence}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">LINKED CITATIONS</span>
                <span className="text-white font-bold">{selectedNodeData.citations} references</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 px-2 flex justify-between items-center text-[10px] font-mono text-slate-500">
        <span>Click any node in graph to inspect semantic provenance</span>
        <span className="hidden sm:inline">HNSW Vector Space • 1536 Dimensions</span>
      </div>
    </div>
  );
};
