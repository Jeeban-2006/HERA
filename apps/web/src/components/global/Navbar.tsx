'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '@/state/auth.store';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/dashboard', label: 'Dashboard', protected: true },
  { href: '/dashboard/pcod', label: 'PCOD', protected: true },
  { href: '/dashboard/mood', label: 'Mood', protected: true },
  { href: '/dashboard/safety', label: 'Safety', protected: true },
  { href: '/dashboard/architecture', label: 'Architecture', protected: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { accessToken, hasHydrated, logout } = useAuthStore();
  const isAuthenticated = hasHydrated && !!accessToken;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-glass border-b border-bio-teal/20">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full border-2 border-bio-teal bg-gradient-to-br from-bio-teal to-bio-teal/50 flex items-center justify-center group-hover:shadow-glow-teal transition-all">
            <span className="text-lg font-bold text-void">♀</span>
          </div>
          <span className="text-xl font-display font-bold text-bio-teal">HERA</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            if (item.protected && !isAuthenticated) return null;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    'font-body text-sm transition-colors relative pb-1',
                    pathname === item.href ? 'text-bio-teal' : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-bio-teal"
                    />
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-body border border-bio-coral/50 text-bio-coral rounded-lg hover:bg-bio-coral/10 transition-all"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login">
                <button className="px-4 py-2 text-sm font-body text-text-muted hover:text-text-primary transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 text-sm font-body bg-bio-teal text-void rounded-lg font-semibold hover:shadow-glow-teal transition-all">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-bio-teal"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-20 left-0 right-0 bg-surface border-b border-bio-teal/20 p-4 space-y-3"
        >
          {navItems.map((item) => {
            if (item.protected && !isAuthenticated) return null;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <span className="block py-2 text-sm font-body text-text-muted hover:text-bio-teal transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <div className="border-t border-bio-teal/10 pt-3 space-y-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm font-body border border-bio-coral/50 text-bio-coral rounded-lg"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full px-4 py-2 text-sm font-body border border-bio-teal/50 text-bio-teal rounded-lg">
                    Sign In
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button className="w-full px-4 py-2 text-sm font-body bg-bio-teal text-void rounded-lg font-semibold">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
