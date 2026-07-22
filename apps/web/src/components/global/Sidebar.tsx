'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Zap, Moon, Shield, MapPin, Droplets, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';
import { useState } from 'react';
import { User } from '@/state/auth.store';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home, color: 'text-bio-teal' },
  { href: '/dashboard/pcod', label: 'PCOD Analyzer', icon: Zap, color: 'text-bio-coral' },
  { href: '/dashboard/mood', label: 'Mood Tracker', icon: Moon, color: 'text-bio-gold' },
  { href: '/dashboard/safety', label: 'Safety Routes', icon: Shield, color: 'text-bio-violet' },
  { href: '/dashboard/period', label: 'Period Tracker', icon: Droplets, color: 'text-bio-coral' },
  { href: '/dashboard/architecture', label: 'Architecture', icon: MapPin, color: 'text-bio-teal' },
];

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const logout = useLogout();

  return (
    <motion.aside
      initial={{ width: isOpen ? 280 : 80 }}
      animate={{ width: isOpen ? 280 : 80 }}
      className="fixed left-0 top-20 h-[calc(100vh-5rem)] bg-glass border-r border-bio-teal/20 flex flex-col z-30 overflow-hidden"
    >
      {/* User Info */}
      {isOpen && user && (
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bio-teal/20 text-bio-teal flex items-center justify-center font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-bio-teal truncate">{user.name}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 pt-4 px-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-lg transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                isActive ? 'border-l-2 bg-white/10' : 'hover:bg-white/5 text-text-muted'
              }`}
              style={isActive ? { borderLeftColor: 'var(--bio-teal)' } : {}}
            >
                <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-text-muted shrink-0'}`} />
                {isOpen && <span className="text-sm font-body whitespace-nowrap">{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-bio-teal/20 p-3 space-y-2">
        <Link href="/profile">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-lg hover:bg-white/5 text-text-muted flex items-center gap-3 cursor-pointer transition-all"
          >
            <Settings className="w-5 h-5 shrink-0" />
            {isOpen && <span className="text-sm font-body whitespace-nowrap">Profile</span>}
          </motion.div>
        </Link>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => logout()}
          className="w-full p-3 rounded-lg hover:bg-bio-coral/10 text-bio-coral flex items-center gap-3 cursor-pointer transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span className="text-sm font-body whitespace-nowrap">Logout</span>}
        </motion.button>
      </div>

      {/* Collapse Toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 w-6 h-6 bg-bio-teal rounded-full flex items-center justify-center text-void hover:shadow-glow-teal transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-xs font-bold">{isOpen ? '←' : '→'}</span>
      </motion.button>
    </motion.aside>
  );
}
