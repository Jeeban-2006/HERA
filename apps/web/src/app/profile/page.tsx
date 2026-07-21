'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, ArrowLeft, Settings } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import Link from 'next/link';

const profileSchema = z.object({
  cycle_length: z.number().min(21, 'Cycle length must be at least 21 days').max(35, 'Cycle length must be at most 35 days'),
  last_period_date: z.string().nonempty('Last period date is required'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['health-profile'],
    queryFn: authApi.getHealthProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        cycle_length: profile.cycle_length || 28,
        last_period_date: profile.last_period_date || new Date().toISOString().split('T')[0],
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/dashboard" className="text-bio-teal hover:underline flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            Health <span className="text-bio-teal">Profile</span>
          </h1>
          <p className="text-text-muted">Manage your cycle settings to unlock mood pattern insights.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-bio-teal" />
          </div>
        ) : (
          <GlassCard className="p-8" glowColor="teal">
            <div className="flex items-center gap-2 mb-6 text-bio-teal">
              <Settings className="w-5 h-5" />
              <h2 className="text-lg font-bold font-display uppercase tracking-wide">Cycle Settings</h2>
            </div>
            
            {(!profile?.cycle_length || !profile?.last_period_date) && (
              <div className="bg-bio-teal/10 border border-bio-teal/20 text-bio-teal p-4 rounded-lg text-sm mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>Set up your cycle info to unlock mood pattern insights!</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-body uppercase tracking-wide">Average Cycle Length (Days)</label>
                <input
                  type="number"
                  {...register('cycle_length', { valueAsNumber: true })}
                  className="input-base"
                  placeholder="28"
                />
                {errors.cycle_length && <p className="text-red-400 text-xs mt-1">{errors.cycle_length.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-muted font-body uppercase tracking-wide">First Day of Last Period</label>
                <input
                  type="date"
                  {...register('last_period_date')}
                  className="input-base"
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.last_period_date && <p className="text-red-400 text-xs mt-1">{errors.last_period_date.message}</p>}
              </div>

              <GlowButton
                type="submit"
                variant="primary"
                accent="teal"
                className="w-full mt-4 flex items-center justify-center gap-2"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Settings'}
              </GlowButton>
              
              {updateProfileMutation.isSuccess && (
                <p className="text-green-400 text-sm text-center mt-3">Profile updated successfully!</p>
              )}
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
