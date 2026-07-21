'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToastStore } from '@/state/ui.store';
import { TOAST_DURATION } from '@/lib/constants';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const duration = toast.duration ?? TOAST_DURATION;

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, removeToast]);

  const typeStyles = {
    success: 'bg-bio-teal/10 border-bio-teal/50 text-bio-teal',
    error: 'bg-bio-coral/10 border-bio-coral/50 text-bio-coral',
    info: 'bg-bio-gold/10 border-bio-gold/50 text-bio-gold',
    warning: 'bg-bio-violet/10 border-bio-violet/50 text-bio-violet',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className={`relative px-4 py-3 rounded-lg border backdrop-blur-glass flex items-start gap-3 max-w-sm ${typeStyles[toast.type]}`}
    >
      <div className="flex-1 text-sm font-body">{toast.message}</div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        style={{ transformOrigin: 'right' }}
        className={`absolute bottom-0 left-0 right-0 h-1 bg-current ${typeStyles[toast.type]}`}
      />
    </motion.div>
  );
}

export function ToastProvider() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
