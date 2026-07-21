'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUpBlur } from '@/lib/animation';
import { GlowingBadge, ScrollIndicator } from '@/components/animations/index';

const ScrollParticles = dynamic(
  () => import('@/components/landing/ScrollParticles').then(m => ({ default: m.ScrollParticles })),
  { ssr: false }
);

// ─── Hero ────────────────────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef(null);

  return (
    <div id="hero" ref={ref} className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-bio-teal/20 via-bio-teal/5 to-transparent rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
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

// ─── Problem ─────────────────────────────────────────────────────────────────
function ProblemSection() {
  return (
    <div id="problem" className="py-32 px-4 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            Healthcare wasn&apos;t built for her.<br />
            <span className="text-bio-coral">So we built HERA.</span>
          </h2>
          <p className="text-lg text-text-muted font-body leading-relaxed">
            For decades, women&apos;s health has been sidelined. Symptoms dismissed as &quot;normal.&quot; Pain ignored. Hormones misunderstood. HERA bridges the gap between how a woman feels and what clinical data proves.
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

// ─── Pillars ─────────────────────────────────────────────────────────────────
function PillarsSection() {
  const pillars = [
    {
      id: 'pcod',
      title: 'PCOD Intelligence',
      desc: 'Our XGBoost AI model analyzes lab results, lifestyle factors, and cycle history to identify PCOD subtypes with clinical precision.',
      color: 'teal',
      image: '/assets/pcod_asset.png',
      stats: ['4 Subtypes Identified', '92% Model Accuracy'],
    },
    {
      id: 'mood',
      title: 'Mood & Cycle Mapping',
      desc: 'Track the invisible connection. See exactly how your cycle phase dictates your energy, mood, and cognitive performance.',
      color: 'gold',
      image: '/assets/mood_asset.png',
      stats: ['Hormone Correlation', 'Predictive Insights'],
    },
    {
      id: 'safety',
      title: 'Real-time Safety Routing',
      desc: 'Navigate the world with confidence. HERA calculates the safest route home using live environmental, lighting, and community safety data.',
      color: 'violet',
      image: '/assets/safety_asset.png',
      stats: ['Lighting Data Analysis', 'Safe-Zone Mapping'],
    },
  ];

  return (
    <div id="pillars" className="py-32 space-y-32">
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
              viewport={{ once: true, margin: '-100px' }}
              className="flex-1 space-y-6"
            >
              <GlowingBadge color={pillar.color as 'teal' | 'gold' | 'violet' | undefined}>
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
                <Image src={pillar.image} alt={pillar.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-60" />
              </div>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Health Journey Timeline (auto-animating) ─────────────────────────────────
const journeySteps = [
  {
    title: 'Day 1 — First Analysis',
    body: "Complete your symptom assessment and upload lab results. HERA's AI identifies your PCOD subtype within seconds.",
    color: '#00FFD1',
    side: 'right',
  },
  {
    title: 'Week 1 — Pattern Recognition',
    body: 'Log your daily mood, energy, and symptoms. HERA begins mapping your unique hormonal fingerprint.',
    color: '#FFD166',
    side: 'left',
  },
  {
    title: 'Month 1 — Deep Insights',
    body: 'Your first full cycle analysis arrives. See exactly how your hormones shape your mood and energy.',
    color: '#9B5DE5',
    side: 'right',
  },
  {
    title: 'Ongoing — Companion Mode',
    body: 'HERA learns and grows with you. Recommendations sharpen, predictions improve, and your health journey deepens.',
    color: '#FF5F7E',
    side: 'left',
  },
] as const;

function HealthJourneySection() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through steps
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep(s => (s + 1) % journeySteps.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="journey" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,255,209,0.05)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            className="text-bio-teal font-mono text-sm uppercase tracking-widest mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Your Journey
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl font-display font-bold text-text-primary"
            style={{ letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Your health journey with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bio-teal to-bio-coral">
              HERA
            </span>
          </motion.h2>
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-3 mb-12">
          {journeySteps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i === activeStep ? step.color : 'rgba(255,255,255,0.2)',
                transform: i === activeStep ? 'scale(1.4)' : 'scale(1)',
                boxShadow: i === activeStep ? `0 0 10px ${step.color}80` : 'none',
              }}
            />
          ))}
        </div>

        {/* Active step card — big animated display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border p-8 md:p-12 text-center mb-12 relative overflow-hidden"
            style={{
              borderColor: `${journeySteps[activeStep].color}30`,
              background: `radial-gradient(ellipse at center, ${journeySteps[activeStep].color}10 0%, transparent 70%)`,
            }}
          >
            {/* Step number */}
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full font-mono font-bold text-sm mb-4"
              style={{
                backgroundColor: `${journeySteps[activeStep].color}20`,
                color: journeySteps[activeStep].color,
                border: `1px solid ${journeySteps[activeStep].color}40`,
              }}
            >
              0{activeStep + 1}
            </div>
            <h3
              className="text-2xl md:text-3xl font-display font-bold mb-4"
              style={{ color: journeySteps[activeStep].color }}
            >
              {journeySteps[activeStep].title}
            </h3>
            <p className="text-text-muted font-body leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
              {journeySteps[activeStep].body}
            </p>

            {/* Animated progress bar */}
            <div className="mt-8 h-px w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: journeySteps[activeStep].color }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* All step list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {journeySteps.map((step, i) => (
            <motion.button
              key={step.title}
              onClick={() => setActiveStep(i)}
              className="text-left p-5 rounded-2xl border transition-all duration-300"
              style={{
                borderColor: i === activeStep ? `${step.color}40` : 'rgba(255,255,255,0.06)',
                background: i === activeStep ? `${step.color}08` : 'transparent',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: step.color,
                    boxShadow: i === activeStep ? `0 0 8px ${step.color}` : 'none',
                  }}
                />
                <p className="text-sm font-mono font-semibold" style={{ color: step.color }}>
                  {step.title}
                </p>
              </div>
              <p className="text-xs text-text-muted font-body leading-relaxed pl-5">{step.body}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials (auto-scrolling carousel) ───────────────────────────────────
const testimonials = [
  {
    text: '"HERA helped me understand my PCOD subtype in 10 minutes. My doctor was genuinely impressed with the analysis."',
    name: 'Priya M.',
    role: 'PCOD patient, Bangalore',
    color: '#00FFD1',
  },
  {
    text: '"The mood tracking and cycle correlation completely changed how I plan my weeks. I finally understand my own patterns."',
    name: 'Sarah K.',
    role: 'Wellness advocate, Mumbai',
    color: '#FFD166',
  },
  {
    text: '"The safety routing is something I use every single evening. It is not just an app — it feels like a companion."',
    name: 'Ananya R.',
    role: 'Graduate student, Delhi',
    color: '#9B5DE5',
  },
  {
    text: '"For the first time someone — something — took my symptoms seriously and gave me a real explanation."',
    name: 'Meera T.',
    role: 'Software engineer, Hyderabad',
    color: '#FF5F7E',
  },
];

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive(a => (a + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div id="testimonials" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(155,93,229,0.05)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            className="text-bio-violet font-mono text-sm uppercase tracking-widest mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Real Stories
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl font-display font-bold text-text-primary"
            style={{ letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Women who found{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bio-violet to-bio-coral">
              their answers
            </span>
          </motion.h2>
        </div>

        {/* Big quote card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border p-8 md:p-12 mb-8 relative overflow-hidden"
            style={{
              borderColor: `${testimonials[active].color}25`,
              background: `radial-gradient(ellipse at top left, ${testimonials[active].color}10 0%, transparent 60%)`,
            }}
          >
            {/* Giant quote mark */}
            <div
              className="text-8xl font-display leading-none absolute top-4 left-8 opacity-15 select-none"
              style={{ color: testimonials[active].color }}
            >
              &ldquo;
            </div>

            <p className="text-xl md:text-2xl font-accent italic text-text-primary leading-relaxed mb-8 relative z-10">
              {testimonials[active].text}
            </p>

            <div className="flex items-center gap-4 relative z-10">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: `${testimonials[active].color}25`,
                  color: testimonials[active].color,
                  border: `1px solid ${testimonials[active].color}40`,
                }}
              >
                {testimonials[active].name[0]}
              </div>
              <div>
                <p className="font-semibold text-text-primary font-body">{testimonials[active].name}</p>
                <p className="text-sm text-text-muted font-body">{testimonials[active].role}</p>
              </div>

              {/* Color accent bar */}
              <div
                className="ml-auto h-1 w-16 rounded-full"
                style={{ backgroundColor: testimonials[active].color, opacity: 0.6 }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex justify-center gap-3">
          {testimonials.map((t, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i === active ? t.color : 'rgba(255,255,255,0.2)',
                transform: i === active ? 'scale(1.4)' : 'scale(1)',
                boxShadow: i === active ? `0 0 10px ${t.color}80` : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <div id="cta" className="relative py-40 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bio-teal/20 via-void to-void pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 text-center space-y-8 px-4"
      >
        <h2 className="text-5xl md:text-7xl font-display font-bold">
          Your body.<br />Your data.<br /><span className="text-bio-teal">Your power.</span>
        </h2>
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-void selection:bg-bio-teal/30 relative">
      {/* ── Fixed 3D scroll-morph particle canvas (z-index 1, pointer-events none) ── */}
      <ScrollParticles />

      {/* ── All page content sits above the canvas (z-index 10) ── */}
      <div className="relative" style={{ zIndex: 10 }}>
        <HeroSection />
        <ProblemSection />
        <PillarsSection />
        <HealthJourneySection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </main>
  );
}
