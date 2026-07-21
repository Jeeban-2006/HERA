'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import type { MoodInsight } from '@/types/mood.types';

const TYPE_CONFIG = {
  peak: { color: '#FFD166', icon: '⚡', border: 'border-bio-gold/20 hover:border-bio-gold/50' },
  pms_risk: { color: '#FF5F7E', icon: '⚠️', border: 'border-bio-coral/20 hover:border-bio-coral/50' },
  pattern: { color: '#00FFD1', icon: '📊', border: 'border-bio-teal/20 hover:border-bio-teal/50' },
  stress: { color: '#9B5DE5', icon: '🌀', border: 'border-bio-violet/20 hover:border-bio-violet/50' },
};

interface InsightCardProps {
  insight: MoodInsight;
  index: number;
}

export function InsightCard({ insight, index }: InsightCardProps) {
  const config = TYPE_CONFIG[insight.type];
  const sparkData = insight.sparkline.map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard
        className={`p-5 border transition-all duration-300 ${config.border}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <h4 className="text-sm font-semibold text-text-primary">{insight.title}</h4>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border" style={{
            color: config.color,
            borderColor: `${config.color}40`,
            backgroundColor: `${config.color}10`,
          }}>
            {insight.confidence}%
          </span>
        </div>

        <p className="text-xs text-text-muted leading-relaxed mb-4">{insight.message}</p>

        {/* Sparkline */}
        <ResponsiveContainer width="100%" height={32}>
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={config.color}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </motion.div>
  );
}
