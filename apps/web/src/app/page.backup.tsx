'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { slideUpBlur, staggeredFadeIn, fadeInItem } from '@/lib/animation';
import { GlowingBadge, ScrollIndicator } from '@/components/animations/index';

function HeroSection() {
  const ref = useRef(null);

  return (
    <div ref={ref} className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Dynamic Animated Background - Optimized for Performance */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-bio-teal/20 via-bio-teal/5 to-transparent rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-30%] left-[-10%] w-[1000px] h-[1000px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-bio-violet/20 via-bio-violet/5 to-transparent rounded-full"
        />
      </div>
      
      <div className="max-w-4xl mx-auto w-full text-center z-10 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="mb-8 flex justify-center"
        >
          <GlowingBadge color="teal">AI-Powered Women&apos;s Intelligence Platform</GlowingBadge>
        </motion.div>

        <div className="space-y-2">
          {['She Knows', 'Her Body.', 'We Prove It.'].map((line, i) => (
            <motion.h1
              key={i}
              variants={slideUpBlur}
              custom={i}
              initial={false}
              animate="visible"
              className={`text-6xl md:text-8xl lg:text-9xl font-display font-bold ${
                i === 0 ? 'text-bio-teal' : i === 1 ? 'text-text-primary' : 'text-bio-coral'
              }`}
              style={{ letterSpacing: '-0.02em' }}
            >
              {line}
            </motion.h1>
          ))}
        </div>

        <motion.p
          variants={slideUpBlur}
          custom={3}
          initial={false}
          animate="visible"
          className="mt-8 text-lg md:text-xl font-accent text-text-muted max-w-2xl mx-auto"
        >
          From hormones to heartbeats to safe paths home — HERA sees what others miss.
        </motion.p>

        <motion.div initial={false} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-20 flex justify-center">
          <ScrollIndicator />
        </motion.div>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <div className="py-32 px-4 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            Healthcare wasn&apos;t built for her.<br/>
            <span className="text-bio-coral">So we built HERA.</span>
          </h2>
          <p className="text-lg text-text-muted font-body leading-relaxed">
            For decades, women&apos;s health has been sidelined. Symptoms dismissed as "normal." Pain ignored. Hormones misunderstood. HERA bridges the gap between how a woman feels and what clinical data proves.
          </p>
          <div className="flex items-center gap-4 text-bio-gold font-mono text-sm border border-bio-gold/20 bg-bio-gold/5 p-4 rounded-xl w-fit">
            <span className="text-2xl">⚠</span>
            <span>70% of PCOD cases go undiagnosed globally.</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-surface flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-bio-coral/20 to-transparent mix-blend-overlay" />
          <div className="text-center p-8 space-y-4 relative z-10">
             <div className="text-6xl animate-pulse">💔</div>
             <h3 className="text-xl font-body font-bold text-white/50">The Data Void</h3>
             <p className="text-sm text-text-muted/50">Clinical trials historically excluded female participants. The data is incomplete.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PillarsSection() {
  const pillars = [
    {
      id: 'pcod',
      title: 'PCOD Intelligence',
      desc: 'Our XGBoost AI model analyzes lab results, lifestyle factors, and cycle history to identify PCOD subtypes with clinical precision.',
      color: 'teal',
      image: '/assets/pcod_asset.png',
      stats: ['4 Subtypes Identified', '92% Model Accuracy']
    },
    {
      id: 'mood',
      title: 'Mood & Cycle Mapping',
      desc: 'Track the invisible connection. See exactly how your cycle phase dictates your energy, mood, and cognitive performance.',
      color: 'gold',
      image: '/assets/mood_asset.png',
      stats: ['Hormone Correlation', 'Predictive Insights']
    },
    {
      id: 'safety',
      title: 'Real-time Safety Routing',
      desc: 'Navigate the world with confidence. HERA calculates the safest route home using live environmental, lighting, and community safety data.',
      color: 'violet',
      image: '/assets/safety_asset.png',
      stats: ['Lighting Data Analysis', 'Safe-Zone Mapping']
    }
  ];

  return (
    <div className="py-32 space-y-32">
      <div className="text-center px-4">
        <h2 className="text-5xl font-display font-bold">The Three Pillars of HERA</h2>
        <p className="text-text-muted mt-4 font-body">Integrated intelligence working in harmony.</p>
      </div>

      {pillars.map((pillar, idx) => (
        <div key={pillar.id} className="max-w-7xl mx-auto px-4">
          <div className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex-1 space-y-6"
            >
              <GlowingBadge color={pillar.color as "teal"|"gold"|"violet"|undefined}>
                Module 0{idx + 1}
              </GlowingBadge>
              <h3 className="text-4xl md:text-5xl font-display font-bold">{pillar.title}</h3>
              <p className="text-lg text-text-muted font-body leading-relaxed">{pillar.desc}</p>
              
              <div className="flex gap-4 pt-4">
                {pillar.stats.map(stat => (
                  <div key={stat} className="border border-white/10 rounded-full px-4 py-2 text-sm font-mono text-white/70 bg-white/5">
                    {stat}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="flex-1 w-full"
            >
              <div className="relative aspect-square w-full max-w-lg mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src={pillar.image} 
                  alt={pillar.title}
                  fill
                  className="object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-60`} />
              </div>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CTASection() {
  return (
    <div className="relative py-40 overflow-hidden flex items-center justify-center">
      {/* Massive Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bio-teal/20 via-void to-void pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 text-center space-y-8 px-4"
      >
        <h2 className="text-5xl md:text-7xl font-display font-bold">Your body.<br/>Your data.<br/><span className="text-bio-teal">Your power.</span></h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-bio-teal text-void font-bold rounded-lg font-body hover:shadow-glow-teal transition-all duration-300 w-full sm:w-auto"
            >
              Get Started Free
            </motion.button>
          </Link>
          <Link href="/dashboard/architecture">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-bio-teal text-bio-teal rounded-lg font-body hover:bg-bio-teal/10 transition-all duration-300 w-full sm:w-auto"
            >
              View System Architecture
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-void selection:bg-bio-teal/30">
      <HeroSection />
      <ProblemSection />
      <PillarsSection />
      <CTASection />
    </main>
  );
}
