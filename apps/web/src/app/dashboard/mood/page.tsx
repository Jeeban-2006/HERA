'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { useMoodCorrelation, useLogMood } from '@/hooks/useMood';
import { getCyclePhase } from '@/lib/utils/cycle';
import type { MoodState } from '@/types/mood.types';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { MoodDial } from '@/components/mood/MoodDial';
import { CycleWheel } from '@/components/mood/CycleWheel';
import { MoodChart } from '@/components/mood/MoodChart';
import { InsightCard } from '@/components/mood/InsightCard';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<MoodState>('Calm');
  
  // Need health profile to compute cycle day
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['health-profile'],
    queryFn: authApi.getHealthProfile,
  });

  const correlationQuery = useMoodCorrelation(30);
  const logMutation = useLogMood();

  // Compute current cycle day
  let currentCycleDay = 1;
  let currentPhase = getCyclePhase(currentCycleDay);
  let isProfileSetup = false;

  if (profile?.last_period_date && profile?.cycle_length) {
    isProfileSetup = true;
    const lastPeriod = new Date(profile.last_period_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPeriod.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    currentCycleDay = (diffDays % profile.cycle_length) + 1;
    currentPhase = getCyclePhase(currentCycleDay);
  }

  // Calculate mood score mapped from MoodState (simplistic mapping 1-10)
  const getScoreForState = (state: MoodState) => {
    const map: Record<MoodState, number> = {
      'Radiant': 10, 'Energized': 9, 'Focused': 8, 'Calm': 7,
      'Tired': 4, 'Irritable': 3, 'Anxious': 2, 'Sad': 1
    };
    return map[state] || 5;
  };

  const handleLogMood = () => {
    const score = getScoreForState(selectedMood);
    logMutation.mutate({
      date: new Date().toISOString().split('T')[0],
      mood_score: score,
      mood_state: selectedMood,
      energy_level: score // default energy to mood
    });
  };

  const isAlreadyLogged = logMutation.error?.message?.includes('409') || false;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-display font-bold">Mood <span className="text-bio-gold">Tracker</span></h1>
        <p className="text-text-muted">Track your mood and discover hormone-mood correlations</p>
      </div>

      {/* Row 1: Today's Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6" glowColor="gold">
          <h2 className="text-sm font-semibold text-bio-gold uppercase tracking-wide mb-4">How are you feeling?</h2>
          <MoodDial selected={selectedMood} onSelect={setSelectedMood} />
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center justify-between gap-6" glowColor="gold">
          <h2 className="text-sm font-semibold text-bio-gold uppercase tracking-wide self-start">Cycle Phase</h2>
          
          {isProfileLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-bio-gold" />
            </div>
          ) : !isProfileSetup ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 w-full">
              <AlertCircle className="w-8 h-8 text-bio-gold/50" />
              <p className="text-sm text-text-muted">Set up your cycle info to view your phase</p>
              <Link href="/profile" className="text-bio-gold hover:underline text-sm font-bold">Go to Profile →</Link>
            </div>
          ) : (
            <CycleWheel currentDay={currentCycleDay} currentPhase={currentPhase} />
          )}

          <div className="w-full flex flex-col gap-2">
            {isAlreadyLogged && (
              <p className="text-bio-gold text-xs text-center">Already logged for today — come back tomorrow!</p>
            )}
            <GlowButton
              variant={logMutation.isSuccess || isAlreadyLogged ? 'ghost' : 'primary'}
              accent="gold"
              size="md"
              className="w-full"
              onClick={handleLogMood}
              disabled={logMutation.isPending || logMutation.isSuccess || isAlreadyLogged}
            >
              {logMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : logMutation.isSuccess ? (
                '✓ Logged Today'
              ) : isAlreadyLogged ? (
                'Already Logged'
              ) : (
                'Log Today\'s Mood'
              )}
            </GlowButton>
          </div>
        </GlassCard>
      </div>

      {/* Correlation Section */}
      {correlationQuery.isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-bio-gold" />
          <p className="text-text-muted text-sm">Analyzing mood patterns...</p>
        </div>
      ) : correlationQuery.data?.error === 'insufficient_data' ? (
        <GlassCard className="p-10 flex flex-col items-center justify-center text-center gap-4" glowColor="gold">
          <Info className="w-12 h-12 text-bio-gold/50" />
          <h3 className="text-lg font-bold text-bio-gold">Keep Logging!</h3>
          <p className="text-text-muted">
            Log your mood for {7 - (correlationQuery.data.logs_available || 0)} more days to unlock AI pattern analysis.
          </p>
          <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-bio-gold transition-all duration-1000"
              style={{ width: `${((correlationQuery.data.logs_available || 0) / 7) * 100}%` }}
            />
          </div>
        </GlassCard>
      ) : correlationQuery.data && !('error' in correlationQuery.data) ? (
        <>
          <MoodChart data={correlationQuery.data.trendData} correlationScore={correlationQuery.data.correlationScore} />
          <div className="space-y-4 mt-6">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">AI Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {correlationQuery.data.insights.map((insight, idx) => (
                <InsightCard key={insight.type} insight={insight} index={idx} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="py-10 text-center text-red-400">
          <p>Failed to load correlation data. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
