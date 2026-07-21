'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRegister } from '@/hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const registerMutation = useRegister();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-bio-teal/20 border-2 border-bio-teal flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">♀</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-bio-teal">Join HERA</h1>
          <p className="text-text-muted text-sm mt-1 font-body">Create your secure health profile</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-8 space-y-5">
          {registerMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {
                  // @ts-ignore
                  registerMutation.error?.response?.data?.detail || 
                  registerMutation.error?.message || 
                  "Failed to create account. Please try again."
                }
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Jane Doe"
                  className="input-base pl-10"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

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
              <p className="text-text-muted/50 text-[10px] mt-1">Must be 8+ chars with uppercase, lowercase, and number</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-muted font-body uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="input-base pl-10"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={registerMutation.isPending}
              whileHover={registerMutation.isPending ? {} : { y: -2 }}
              whileTap={registerMutation.isPending ? {} : { scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-bio-teal text-void font-bold font-body hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {registerMutation.isPending ? 'Creating account…' : 'Create Account'}
            </motion.button>
          </form>

          <div className="text-center text-sm text-text-muted font-body">
            Already have an account?{' '}
            <Link href="/login" className="text-bio-teal hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
