'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { SymptomSelector } from '@/components/pcod/SymptomSelector';
import { LifestyleForm } from '@/components/pcod/LifestyleForm';
import { LabValuesForm } from '@/components/pcod/LabValuesForm';
import { ReviewStep } from '@/components/pcod/ReviewStep';
import { AnalysisProgress } from '@/components/pcod/AnalysisProgress';
import { ResultPanel } from '@/components/pcod/ResultPanel';
import { useAnalyzePCOD } from '@/hooks/usePCOD';
import type { PCODFormState, PCODAnalysisResult } from '@/types/pcod.types';

const STEPS = ['Symptoms', 'Lifestyle', 'Lab Values', 'Review'];

const defaultForm: PCODFormState = {
  symptoms: [],
  lifestyle: { sleep: 7, stress: 5, exercise: 3, water: 8 },
  labValues: { insulin: '', testosterone: '', lhFsh: '', amh: '', glucose: '' },
};

export default function PCODPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<PCODFormState>(defaultForm);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const analyzeMutation = useAnalyzePCOD();

  const canProceed = () => {
    if (step === 0) return formData.symptoms.length >= 2;
    return true;
  };

  const hasAnyLabValue = (labs: any) => {
    return Object.values(labs).some((v) => v !== '' && v !== null);
  };

  const runAnalysis = () => {
    analyzeMutation.mutate({
      symptoms: formData.symptoms,
      lifestyle: formData.lifestyle,
      lab_values: hasAnyLabValue(formData.labValues) 
        ? {
            ...formData.labValues,
            lh_fsh_ratio: formData.labValues.lhFsh ? Number(formData.labValues.lhFsh) : undefined,
            insulin: formData.labValues.insulin ? Number(formData.labValues.insulin) : undefined,
            testosterone: formData.labValues.testosterone ? Number(formData.labValues.testosterone) : undefined,
            amh: formData.labValues.amh ? Number(formData.labValues.amh) : undefined,
            glucose: formData.labValues.glucose ? Number(formData.labValues.glucose) : undefined,
          } 
        : undefined
    });

    setProgress(0);
    // Looping animation 0 -> 90
    let currentProgress = 0;
    intervalRef.current = setInterval(() => {
      currentProgress += 5;
      if (currentProgress > 90) {
        currentProgress = 90; // Hold at 90%
      }
      setProgress(currentProgress);
    }, 100);
  };

  useEffect(() => {
    if (analyzeMutation.isSuccess) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (analyzeMutation.isError) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(0);
    }
  }, [analyzeMutation.isSuccess, analyzeMutation.isError]);

  const reset = () => {
    setStep(0);
    setFormData(defaultForm);
    setProgress(0);
    setShowResult(false);
    analyzeMutation.reset();
  };

  if (showResult && analyzeMutation.data) {
    return (
      <div className="max-w-4xl mx-auto">
        <ResultPanel result={analyzeMutation.data} onNewAnalysis={reset} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-display font-bold">PCOD <span className="text-bio-coral">Analyzer</span></h1>
        <p className="text-text-muted">AI-driven root cause analysis for PCOD management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <GlassCard className="p-6" glowColor="coral">
            <div className="mb-6">
              <StepIndicator steps={STEPS} currentStep={step} />
            </div>

            {analyzeMutation.isError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Analysis failed. Please check your inputs and try again.</span>
                </div>
                <GlowButton variant="secondary" accent="coral" size="sm" onClick={() => analyzeMutation.reset()}>
                  Try Again
                </GlowButton>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <div>
                    <h2 className="text-lg font-display font-bold text-bio-coral mb-4">Select Your Symptoms</h2>
                    <SymptomSelector
                      selected={formData.symptoms}
                      onChange={(symptoms) => setFormData({ ...formData, symptoms })}
                    />
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <h2 className="text-lg font-display font-bold text-bio-coral mb-4">Lifestyle Factors</h2>
                    <LifestyleForm
                      data={formData.lifestyle}
                      onChange={(lifestyle) => setFormData({ ...formData, lifestyle })}
                    />
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h2 className="text-lg font-display font-bold text-bio-coral mb-4">Lab Values</h2>
                    <LabValuesForm
                      data={formData.labValues}
                      onChange={(labValues) => setFormData({ ...formData, labValues })}
                    />
                  </div>
                )}
                {step === 3 && !analyzeMutation.isPending && (
                  <div>
                    <h2 className="text-lg font-display font-bold text-bio-coral mb-4">Review & Analyse</h2>
                    <ReviewStep
                      formData={formData}
                      onRunAnalysis={runAnalysis}
                      isAnalysing={analyzeMutation.isPending}
                    />
                  </div>
                )}
                {step === 3 && analyzeMutation.isPending && (
                  <div>
                    <h2 className="text-lg font-display font-bold text-bio-coral mb-4">Analysing…</h2>
                    <AnalysisProgress progress={progress} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {!analyzeMutation.isPending && step < 3 && (
              <div className="flex justify-between mt-6 pt-4 border-t border-white/8">
                <GlowButton
                  variant="ghost"
                  accent="coral"
                  size="sm"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </GlowButton>
                <GlowButton
                  variant="primary"
                  accent="coral"
                  size="sm"
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  disabled={!canProceed()}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </GlowButton>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-bio-coral" />
              <h3 className="text-sm font-semibold text-bio-coral">About PCOD</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              PCOD (Polycystic Ovarian Disease) affects 1 in 10 women. Our AI analyses your symptoms, lifestyle, and lab data to identify your specific subtype and root drivers.
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-bio-coral mb-3">PCOD Subtypes</h3>
            <div className="space-y-2">
              {[
                { label: 'Insulin-Resistant', desc: 'Most common — linked to blood sugar' },
                { label: 'Inflammatory', desc: 'Triggered by chronic inflammation' },
                { label: 'Adrenal', desc: 'Driven by stress hormones' },
                { label: 'Post-Pill', desc: 'After stopping contraceptives' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-text-primary">{label}</span>
                  <span className="text-xs text-text-muted">{desc}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
