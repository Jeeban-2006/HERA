import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const pcodAnalysisSchema = z.object({
  symptoms: z.array(z.string()).min(1, 'Select at least one symptom'),
  sleep: z.number().min(0).max(12),
  stress: z.number().min(1).max(10),
  exercise: z.number().min(0).max(7),
  waterIntake: z.number().min(0),
  insulin: z.number().optional(),
  testosterone: z.number().optional(),
  lhFshRatio: z.number().optional(),
  amh: z.number().optional(),
});

export const moodLogSchema = z.object({
  moodScore: z.number().min(1).max(10),
  moodState: z.enum(['radiant', 'calm', 'tired', 'anxious', 'sad', 'irritable', 'focused', 'energized']),
  notes: z.string().optional(),
  date: z.date().optional(),
});

export const safetyRouteSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

export const sosSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  contacts: z.array(z.string().email('Invalid email')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PCODAnalysisInput = z.infer<typeof pcodAnalysisSchema>;
export type MoodLogInput = z.infer<typeof moodLogSchema>;
export type SafetyRouteInput = z.infer<typeof safetyRouteSchema>;
export type SOSInput = z.infer<typeof sosSchema>;
