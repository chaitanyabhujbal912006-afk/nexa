import React, { useState, useEffect, useRef } from 'react';
import { Network, Sliders, Eye, EyeOff, Play, Pause, Layers, Database, ExternalLink, X, ChevronRight, Filter, Info, ShieldCheck } from 'lucide-react';
import { TopologyNode, TopologyEdge, KnowledgeDocument } from '../types';
import { MOCK_TOPOLOGY_NODES, MOCK_TOPOLOGY_EDGES } from '../data/mockKnowledge';
import { playTactileClick, playResolvedChime } from '../utils/audio';

interface ClusterTopologyCanvasProps {
  onInspectDocument?: (docName: string) => void;
}

export const ClusterTopologyCanvas: React.FC<ClusterTopologyCanvasProps> = ({ onInspectDocument }) => {
  const [nodes, setNodes] = useState<TopologyNode[]>(MOCK_TOPOLOGY_NODES);
  const [edges] = useState<TopologyEdge[]>(MOCK_TOPOLOGY_EDGES);

  // Controls state
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'pdf' | 'xlsx' | 'eml' | 'csv'>('All');

  // Selected node inspector drawer
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(MOCK_TOPOLOGY_NODES[0]);

  // Canvas ref for SVG dimensions
  const containerRef = useRef<HTMLDivElement>(null);

  // Physics animation loop simulation
  useEffect(() => {
    if (!isPhysicsActive) return;

    const interval = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const deltaX = (Math.random() - 0.5) * 1.5;
          const deltaY = (Math.random() - 0.5) * 1.5;
          const newX = Math.max(80, Math.min(680, (node.x || 300) + deltaX));
          const newY = Math.max(60, Math.min(460, (node.y || 250) + deltaY));
          return { ...node, x: newX, y: newY };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPhysicsActive]);

  // Filtered nodes
  const filteredNodes = nodes.filter((n) => {
    if (selectedTypeFilter === 'All') return true;
    return n.type === selectedTypeFilter;
  });

  const activeNodeIds = new Set(filteredNodes.map((n) => n.id));

  // Filtered edges based on threshold and visible nodes
  const visibleEdges = edges.filter(
    (e) =>
      e.similarity_score >= similarityThreshold &&
      activeNodeIds.has(e.source) &&
      activeNodeIds.has(e.target)
  );

  // Find nearest neighbors for selected node
  const nearestNeighbors = selectedNode
    ? edges
        .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
        .map((e) => {
          const neighborId = e.source === selectedNode.id ? e.target : e.source;
          const neighborNode = nodes.find((n) => n.id === neighborId);
          return {
            node: neighborNode,
            similarity: e.similarity_score,
          };
        })
        .filter((n) => n.node !== undefined)
        .sort((a, b) => b.similarity - a.similarity)
    : [];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return '#a855f7';
      case 'xlsx':
        return '#38bdf8';
      case 'eml':
        return '#c084fc';
      case 'csv':
        return '#4ade80';
      default:
        return '#818cf8';
    }
  };

  return (
    <div id="cluster-topology-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-6 rounded-[28px] border border-white/15 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-[#c084fc]" />
            <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
              SEMANTIC VECTOR TOPOLOGY
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Cluster Topology Canvas
          </h2>
          <p className="font-sans text-xs text-[#94a3b8] mt-1">
            Visualize multi-dimensional vector embeddings, document similarity clusters, and cross-source semantic affinities.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 p-2.5 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs">
          <div>
            <span className="text-[#94a3b8] text-[10px] block">NODES</span>
            <strong className="text-white">{filteredNodes.length} Documents</strong>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div>
            <span className="text-[#94a3b8] text-[10px] block">SIMILARITY EDGES</span>
            <strong className="text-[#38bdf8]">{visibleEdges.length} Active</strong>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="apple-glass-card rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Type Filters */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
              {(['All', 'pdf', 'xlsx', 'eml', 'csv'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    playTactileClick();
                    setSelectedTypeFilter(type);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    selectedTypeFilter === type
                      ? 'bg-[#7c3aed] text-white shadow-md'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Slider: Similarity Threshold */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs">
              <span className="text-[#94a3b8] text-[10px] whitespace-nowrap">
                SIMILARITY &ge; {(similarityThreshold * 100).toFixed(0)}%
              </span>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#a855f7] cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playTactileClick();
                  setIsPhysicsActive(!isPhysicsActive);
                }}
                className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[10px] cursor-pointer ${
                  isPhysicsActive
                    ? 'bg-[#22c55e]/20 border-[#22c55e]/40 text-[#4ade80]'
                    : 'bg-white/5 border-white/10 text-[#94a3b8]'
                }`}
                title="Toggle Physics Simulation"
              >
                {isPhysicsActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Physics</span>
              </button>

              <button
                onClick={() => {
                  playTactileClick();
                  setShowNodeLabels(!showNodeLabels);
                }}
                className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[10px] cursor-pointer ${
                  showNodeLabels
                    ? 'bg-[#7c3aed]/20 border-[#a855f7]/40 text-[#c084fc]'
                    : 'bg-white/5 border-white/10 text-[#94a3b8]'
                }`}
                title="Toggle Node Labels"
              >
                {showNodeLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Labels</span>
              </button>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div
            ref={containerRef}
            className="apple-glass-card rounded-[28px] border border-white/15 shadow-2xl relative overflow-hidden bg-[#070512] min-h-[520px] flex items-center justify-center"
          >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <svg className="w-full h-[520px] relative z-10 select-none">
              {/* Render Edges */}
              {visibleEdges.map((edge, idx) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isHighlighted =
                  selectedNode &&
                  (selectedNode.id === edge.source || selectedNode.id === edge.target);

                return (
                  <g key={idx}>
                    <line
                      x1={sourceNode.x || 200}
                      y1={sourceNode.y || 200}
                      x2={targetNode.x || 400}
                      y2={targetNode.y || 400}
                      stroke={isHighlighted ? '#c084fc' : 'rgba(168, 85, 247, 0.25)'}
                      strokeWidth={isHighlighted ? 2.5 : Math.max(1, (edge.similarity_score - 0.5) * 4)}
                      strokeDasharray={edge.similarity_score < 0.8 ? '4 4' : undefined}
                    />
                    {/* Edge weight badge if highlighted */}
                    {isHighlighted && (
                      <text
                        x={((sourceNode.x || 0) + (targetNode.x || 0)) / 2}
                        y={((sourceNode.y || 0) + (targetNode.y || 0)) / 2 - 4}
                        fill="#38bdf8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {(edge.similarity_score * 100).toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const nodeColor = getNodeColor(node.type);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x || 300}, ${node.y || 250})`}
                    onClick={() => {
                      playTactileClick();
                      setSelectedNode(node);
                    }}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Outer selection ring */}
                    {isSelected && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="2"
                        className="animate-ping opacity-50"
                      />
                    )}

                    {/* Node Core */}
                    <circle
                      r={isSelected ? '18' : '14'}
                      fill="#0d0a1c"
                      stroke={isSelected ? '#38bdf8' : nodeColor}
                      strokeWidth={isSelected ? '3' : '2'}
                      filter="drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))"
                    />

                    {/* Inner Center Dot */}
                    <circle r="4" fill={nodeColor} />

                    {/* Node Label */}
                    {showNodeLabels && (
                      <text
                        y="28"
                        fill={isSelected ? '#ffffff' : '#cbd5e1'}
                        fontSize="10"
                        fontFamily="sans-serif"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Canvas Legend */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 p-2 rounded-xl bg-[#090616]/80 border border-white/10 font-mono text-[10px] text-[#94a3b8] backdrop-blur-sm z-20">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> PDF</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> Excel</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c084fc]" /> Email</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4ade80]" /> CSV</span>
            </div>
          </div>
        </div>

        {/* Right Drawer: Selected Node Inspector (4 cols) */}
        <div className="lg:col-span-4 apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-5 text-white">
          {selectedNode ? (
            <>
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
                    NODE INSPECTOR
                  </span>
                  <h3 className="font-display text-lg font-bold text-white truncate max-w-[220px]">
                    {selectedNode.label}
                  </h3>
                </div>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#c084fc] border border-[#a855f7]/30">
                  {selectedNode.type}
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs">
                <div>
                  <span className="text-[#94a3b8] block text-[10px]">DEPARTMENT</span>
                  <strong className="text-white">{selectedNode.department}</strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block text-[10px]">FILE SIZE</span>
                  <strong className="text-white">{selectedNode.size}</strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block text-[10px]">EMBEDDINGS</span>
                  <strong className="text-[#38bdf8]">{selectedNode.chunk_count} Chunks</strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block text-[10px]">INDEX STATUS</span>
                  <strong className="text-[#4ade80]">Active & Grounded</strong>
                </div>
              </div>

              {/* Nearest Neighbors List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#cbd5e1] tracking-wider">
                    NEAREST SEMANTIC NEIGHBORS ({nearestNeighbors.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {nearestNeighbors.length > 0 ? (
                    nearestNeighbors.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (item.node) {
                            playTactileClick();
                            setSelectedNode(item.node);
                          }
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="truncate pr-2">
                          <span className="font-sans text-xs text-white group-hover:text-[#38bdf8] truncate block">
                            {item.node?.label}
                          </span>
                          <span className="font-mono text-[10px] text-[#94a3b8]">
                            {item.node?.department}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#4ade80] flex-shrink-0">
                          {(item.similarity * 100).toFixed(0)}% sim
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="font-sans text-xs text-[#94a3b8] italic p-2">
                      No neighbors exceed the active {(similarityThreshold * 100).toFixed(0)}% threshold.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {onInspectDocument && (
                <button
                  onClick={() => {
                    playTactileClick();
                    onInspectDocument(selectedNode.label);
                  }}
                  className="w-full py-2.5 rounded-full btn-orbitsat-purple font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Inspect Chunks in Vault</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-[#94a3b8]">
              <Network className="w-8 h-8 mx-auto mb-2 text-[#7c3aed] opacity-60" />
              <p className="font-sans text-xs">Select any node on the canvas to inspect its semantic properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
