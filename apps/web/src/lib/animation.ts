import { Variants } from 'framer-motion';

export const staggeredFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3 * i,
    },
  }),
};

export const fadeInItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const slideUpBlur: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    filter: 'blur(20px)',
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.15,
    },
  }),
};

export const scaleHover: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.3, ease: 'easeOut' } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

export const shimmerLoad: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(0, 255, 209, 0.15)',
      '0 0 40px rgba(0, 255, 209, 0.25)',
      '0 0 20px rgba(0, 255, 209, 0.15)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const floatingAnimation: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spinAnimation: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pageEnter: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: 100, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const pulseAnimation: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmerSweep = (duration = 2) => ({
  backgroundSize: '200% 100%',
  animation: `shimmer ${duration}s infinite`,
});
