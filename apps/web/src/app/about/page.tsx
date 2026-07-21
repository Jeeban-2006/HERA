'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlowingBadge } from '@/components/animations';

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-4 bg-void relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bio-teal/20 via-void to-void pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <GlowingBadge color="teal">The Vision</GlowingBadge>
          <h1 className="text-5xl md:text-7xl font-display font-bold">About <span className="text-bio-teal">HERA</span></h1>
          <p className="text-xl text-text-muted font-accent max-w-2xl mx-auto">
            Bridging the gap in women&apos;s healthcare through advanced artificial intelligence and data-driven empathy.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface border border-white/5 p-8 md:p-12 rounded-3xl space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-bio-coral">The Origin Story</h2>
            <p className="text-text-muted font-body leading-relaxed text-lg">
              HERA was born from a stark realization: the global medical system has historically excluded women from clinical trials, leading to a massive data void in how female bodies respond to disease, hormones, and treatments. For decades, conditions like PCOD were misunderstood, and women were told their symptoms were &quot;normal.&quot;
            </p>
            <p className="text-text-muted font-body leading-relaxed text-lg">
              We decided to fix that. By leveraging modern Machine Learning (XGBoost) and advanced data correlation, we built a platform that finally listens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold text-bio-gold">Our Mission</h3>
              <p className="text-text-muted font-body leading-relaxed">
                To empower every woman with deep, personalized insights into her own body. No more guessing. No more medical gaslighting. Just pure, actionable intelligence.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold text-bio-violet">The Technology</h3>
              <p className="text-text-muted font-body leading-relaxed">
                Powered by a Python-based Microservice Architecture, Next.js, and PostgreSQL. Our AI models analyze everything from lab reports to daily energy fluctuations to predict and protect.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Creator Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6 pt-12"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-bio-teal to-bio-violet p-1">
            <div className="w-full h-full bg-void rounded-full flex items-center justify-center">
              <span className="text-3xl">👨‍💻</span>
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold">Built by <span className="text-bio-teal">Jeeban Krushna Sahu</span></h2>
          <p className="text-text-muted font-body max-w-xl mx-auto">
            A passionate Full-Stack Engineer and AI enthusiast dedicated to building technology that makes a real, tangible difference in people&apos;s lives. 
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors font-mono text-sm text-text-muted">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors font-mono text-sm text-text-muted">LinkedIn</a>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
