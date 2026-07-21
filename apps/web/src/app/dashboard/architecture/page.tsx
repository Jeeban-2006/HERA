'use client';

import { motion } from 'framer-motion';
import { SystemDiagram } from '@/components/architecture/SystemDiagram';
import { GlassCard } from '@/components/ui/GlassCard';

const TECH_STACK = [
  { layer: 'Client', items: ['Next.js 14', 'React Native + Expo', 'Tailwind CSS', 'Framer Motion'], color: '#00FFD1' },
  { layer: 'Gateway', items: ['FastAPI', 'JWT Auth', 'Uvicorn', 'Rate Limiting'], color: '#F0F4FF' },
  { layer: 'Services', items: ['XGBoost (PCOD)', 'Prophet + LSTM (Mood)', 'Dijkstra A* (Safety)', 'Poetry'], color: '#FF5F7E' },
  { layer: 'Database', items: ['PostgreSQL 16', 'Redis 7', 'MongoDB Atlas', 'Alembic'], color: '#FFD166' },
  { layer: 'Cloud', items: ['AWS ECS Fargate', 'Firebase FCM', 'Terraform IaC', 'Docker Compose'], color: '#9B5DE5' },
];

export default function ArchitecturePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-display font-bold">System <span className="text-bio-teal">Architecture</span></h1>
        <p className="text-text-muted">Interactive visualization — click any node to explore the tech stack</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Diagram */}
        <GlassCard className="p-6" glowColor="teal">
          <SystemDiagram />
        </GlassCard>

        {/* Tech Stack Sidebar */}
        <div className="space-y-3">
          {TECH_STACK.map((layer, idx) => (
            <motion.div
              key={layer.layer}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <GlassCard className="p-4">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: layer.color }}>
                  {layer.layer} Layer
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {layer.items.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-text-muted border border-white/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
