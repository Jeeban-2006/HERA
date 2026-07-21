'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeInItem, staggeredFadeIn } from '@/lib/animation';

const modules = [
  {
    id: 'pcod',
    title: 'PCOD Analyzer',
    description: 'AI-driven root cause analysis for PCOD',
    icon: '🧬',
    color: 'bg-bio-coral',
    href: '/dashboard/pcod',
  },
  {
    id: 'mood',
    title: 'Mood Tracker',
    description: 'Track mood and hormone correlations',
    icon: '🌙',
    color: 'bg-bio-gold',
    href: '/dashboard/mood',
  },
  {
    id: 'safety',
    title: 'Safety Routes',
    description: 'Intelligent and safe route recommendations',
    icon: '🛡️',
    color: 'bg-bio-violet',
    href: '/dashboard/safety',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-5xl font-display font-bold">Welcome Back</h1>
        <p className="text-text-muted text-lg">Access your health insights and tools</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.section
        variants={staggeredFadeIn}
        initial={false}
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          variants={fadeInItem}
          className="p-6 rounded-xl bg-white/5 border border-bio-teal/20 backdrop-blur-glass"
        >
          <div className="text-3xl font-bold text-bio-teal mb-2">3</div>
          <div className="text-sm text-text-muted">AI Systems Active</div>
        </motion.div>
        <motion.div
          variants={fadeInItem}
          className="p-6 rounded-xl bg-white/5 border border-bio-coral/20 backdrop-blur-glass"
        >
          <div className="text-3xl font-bold text-bio-coral mb-2">∞</div>
          <div className="text-sm text-text-muted">Real-time Analysis</div>
        </motion.div>
        <motion.div
          variants={fadeInItem}
          className="p-6 rounded-xl bg-white/5 border border-bio-gold/20 backdrop-blur-glass"
        >
          <div className="text-3xl font-bold text-bio-gold mb-2">10+</div>
          <div className="text-sm text-text-muted">Health Signals Tracked</div>
        </motion.div>
      </motion.section>

      {/* Module Cards */}
      <motion.section
        variants={staggeredFadeIn}
        initial={false}
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {modules.map((module) => (
          <Link key={module.id} href={module.href}>
            <motion.div
              variants={fadeInItem}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="p-8 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-glass cursor-pointer hover:border-white/20 transition-all duration-300"
            >
              <div className="text-6xl mb-4">{module.icon}</div>
              <h3 className="text-2xl font-bold font-display mb-2">{module.title}</h3>
              <p className="text-text-muted text-sm mb-4">{module.description}</p>
              <div className="text-bio-teal text-sm font-semibold">Launch →</div>
            </motion.div>
          </Link>
        ))}
      </motion.section>

      {/* Recent Activity */}
      <motion.section
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-display font-bold">Recent Activity</h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-glass text-center text-text-muted">
          <p>No activity yet. Start by using one of the modules above.</p>
        </div>
      </motion.section>
    </div>
  );
}
