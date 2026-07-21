'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AnimatedDot } from './AnimatedDot';

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  color: string;
  layer: string;
  details: string[];
}

interface EdgeData {
  from: string;
  to: string;
  animated: boolean;
}

const NODE_DATA: NodeData[] = [
  { id: 'web-app',    label: 'Web App',       sublabel: 'Next.js 14',          x: 150, y: 60,  color: '#00FFD1', layer: 'Client',   details: ['App Router', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
  { id: 'mobile-app', label: 'Mobile App',    sublabel: 'React Native',         x: 390, y: 60,  color: '#00FFD1', layer: 'Client',   details: ['Expo SDK 50', 'React Navigation', 'NativeWind'] },
  { id: 'api-gw',     label: 'API Gateway',   sublabel: 'FastAPI + JWT',        x: 270, y: 180, color: '#F0F4FF', layer: 'Gateway',  details: ['JWT Auth', 'Rate Limiting', 'Request Routing', 'CORS'] },
  { id: 'pcod-svc',   label: 'PCOD Service',  sublabel: 'XGBoost ML',          x: 90,  y: 300, color: '#FF5F7E', layer: 'Services', details: ['XGBoost Classifier', 'Subtype Detection', 'Feature Engineering'] },
  { id: 'mood-svc',   label: 'Mood Service',  sublabel: 'Prophet + LSTM',      x: 270, y: 300, color: '#FFD166', layer: 'Services', details: ['Facebook Prophet', 'LSTM Forecasting', 'Correlation Engine'] },
  { id: 'safety-svc', label: 'Safety Service',sublabel: 'Dijkstra A*',         x: 450, y: 300, color: '#9B5DE5', layer: 'Services', details: ['Route Scoring', 'Heatmap Analysis', 'Real-time SOS'] },
  { id: 'postgres',   label: 'PostgreSQL',    sublabel: 'Users + Analyses',    x: 90,  y: 420, color: '#00FFD1', layer: 'Database', details: ['User Profiles', 'PCOD Results', 'Mood Logs', 'Alembic Migrations'] },
  { id: 'redis',      label: 'Redis',         sublabel: 'Sessions + Cache',    x: 270, y: 420, color: '#FFD166', layer: 'Database', details: ['JWT Refresh Tokens', 'Rate Limit State', 'Response Cache'] },
  { id: 'mongodb',    label: 'MongoDB',       sublabel: 'Health Journal',      x: 450, y: 420, color: '#9B5DE5', layer: 'Database', details: ['Route History', 'Safety Events', 'GeoJSON Data'] },
  { id: 'aws',        label: 'AWS ECS',       sublabel: 'Fargate Containers',  x: 180, y: 530, color: '#FF5F7E', layer: 'Cloud',    details: ['Auto-scaling', 'Load Balancing', 'ECR Registry', 'CloudWatch'] },
  { id: 'firebase',   label: 'Firebase',      sublabel: 'SOS Notifications',   x: 390, y: 530, color: '#FFD166', layer: 'Cloud',    details: ['FCM Push Alerts', 'Realtime DB', 'Emergency Broadcasting'] },
];

const EDGE_DATA: EdgeData[] = [
  { from: 'web-app',    to: 'api-gw',     animated: true },
  { from: 'mobile-app', to: 'api-gw',     animated: true },
  { from: 'api-gw',     to: 'pcod-svc',   animated: true },
  { from: 'api-gw',     to: 'mood-svc',   animated: true },
  { from: 'api-gw',     to: 'safety-svc', animated: true },
  { from: 'pcod-svc',   to: 'postgres',   animated: true },
  { from: 'mood-svc',   to: 'redis',      animated: true },
  { from: 'mood-svc',   to: 'postgres',   animated: true },
  { from: 'safety-svc', to: 'mongodb',    animated: true },
  { from: 'safety-svc', to: 'firebase',   animated: true },
  { from: 'postgres',   to: 'aws',        animated: true },
  { from: 'redis',      to: 'aws',        animated: true },
  { from: 'mongodb',    to: 'aws',        animated: true },
];

const LAYER_LABELS: { label: string; y: number }[] = [
  { label: 'Client', y: 86 },
  { label: 'Gateway', y: 206 },
  { label: 'Services', y: 326 },
  { label: 'Database', y: 446 },
  { label: 'Cloud', y: 556 },
];

const NODE_W = 120;
const NODE_H = 48;

function getNodeCenter(node: NodeData) {
  return { x: node.x + NODE_W / 2, y: node.y + NODE_H / 2 };
}

export function SystemDiagram() {
  const [activeNode, setActiveNode] = useState<NodeData | null>(null);

  const getNode = (id: string) => NODE_DATA.find((n) => n.id === id)!;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 560 600"
        className="w-full"
        style={{ maxHeight: '600px' }}
        onClick={() => setActiveNode(null)}
      >
        {/* Layer labels */}
        {LAYER_LABELS.map(({ label, y }) => (
          <text key={label} x="18" y={y} fontSize="9" fill="#6B7B9E" fontFamily="DM Sans, sans-serif" fontWeight="600" textAnchor="middle" transform={`rotate(-90, 18, ${y})`}>
            {label.toUpperCase()}
          </text>
        ))}

        {/* Horizontal dividers */}
        {[140, 250, 370, 480].map((y) => (
          <line key={y} x1="36" y1={y} x2="540" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 8" />
        ))}

        {/* Edges */}
        {EDGE_DATA.map((edge, idx) => {
          const fromNode = getNode(edge.from);
          const toNode = getNode(edge.to);
          if (!fromNode || !toNode) return null;
          const from = getNodeCenter(fromNode);
          const to = getNodeCenter(toNode);
          const color = fromNode.color;
          const pathId = `edge-${edge.from}-${edge.to}`;
          return (
            <g key={idx}>
              <defs>
                <path
                  id={pathId}
                  d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                />
              </defs>
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={edge.animated ? color : 'rgba(255,255,255,0.12)'}
                strokeWidth={edge.animated ? '1.5' : '1'}
                strokeOpacity={edge.animated ? '0.5' : '1'}
                strokeDasharray={edge.animated ? undefined : '3 4'}
              />
            </g>
          );
        })}

        {/* Animated dots on edges */}
        {EDGE_DATA.filter((e) => e.animated).map((edge, i) => (
          <AnimatedDot
            key={`dot-${edge.from}-${edge.to}`}
            pathId={`edge-${edge.from}-${edge.to}`}
            color={getNode(edge.from).color}
            duration={2000}
            delay={i * 300}
          />
        ))}

        {/* Nodes */}
        {NODE_DATA.map((node, idx) => {
          const isActive = activeNode?.id === node.id;
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.07, duration: 0.4 }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveNode(isActive ? null : node);
              }}
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.03 }}
            >
              <rect
                x={node.x} y={node.y}
                width={NODE_W} height={NODE_H}
                rx="8"
                fill={`${node.color}14`}
                stroke={isActive ? node.color : `${node.color}50`}
                strokeWidth={isActive ? '2' : '1'}
              />
              <text x={node.x + NODE_W / 2} y={node.y + 17} textAnchor="middle" fontSize="11" fill="#F0F4FF" fontFamily="DM Sans, sans-serif" fontWeight="600">
                {node.label}
              </text>
              <text x={node.x + NODE_W / 2} y={node.y + 31} textAnchor="middle" fontSize="9" fill="#6B7B9E" fontFamily="DM Sans, sans-serif">
                {node.sublabel}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Active Node Tooltip */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 w-52 bg-surface border border-white/15 rounded-xl p-4 shadow-lg z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold" style={{ color: activeNode.color }}>{activeNode.label}</div>
                <div className="text-xs text-text-muted">{activeNode.layer} Layer</div>
              </div>
              <button onClick={() => setActiveNode(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-1">
              {activeNode.details.map((d) => (
                <li key={d} className="text-xs text-text-muted flex items-center gap-1.5">
                  <span style={{ color: activeNode.color }}>·</span> {d}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
