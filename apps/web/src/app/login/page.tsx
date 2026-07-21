'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const loginMutation = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-bio-teal/20 border-2 border-bio-teal flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">♀</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-bio-teal">HERA</h1>
          <p className="text-text-muted text-sm mt-1 font-body">Sign in to your health dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/10 rounded-2xl p-8 space-y-5">
          {loginMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {
                  // @ts-ignore
                  loginMutation.error?.response?.data?.detail || 
                  loginMutation.error?.message || 
                  "Invalid email or password."
                }
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="input-base pl-10"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="input-base pl-10"
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loginMutation.isPending}
              whileHover={loginMutation.isPending ? {} : { y: -2 }}
              whileTap={loginMutation.isPending ? {} : { scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-bio-teal text-void font-bold font-body hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>

          <div className="text-center text-sm text-text-muted font-body">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-bio-teal hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
