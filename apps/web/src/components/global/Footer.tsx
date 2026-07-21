import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5 py-12 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="w-8 h-8 rounded-full border-2 border-bio-teal bg-gradient-to-br from-bio-teal to-bio-teal/50 flex items-center justify-center group-hover:shadow-glow-teal transition-all">
              <span className="text-sm font-bold text-void">♀</span>
            </div>
            <span className="text-lg font-display font-bold text-bio-teal">HERA</span>
          </Link>
          <p className="text-sm text-text-muted max-w-xs font-body leading-relaxed">
            AI-powered women&apos;s health intelligence platform. PCOD analysis, mood tracking, and women safety.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-text-primary font-display">Platform</h4>
          <ul className="space-y-2 text-sm text-text-muted font-body">
            <li><Link href="/dashboard" className="hover:text-bio-teal transition-colors">Dashboard</Link></li>
            <li><Link href="/dashboard/pcod" className="hover:text-bio-teal transition-colors">PCOD Analyzer</Link></li>
            <li><Link href="/dashboard/mood" className="hover:text-bio-teal transition-colors">Mood Tracker</Link></li>
            <li><Link href="/dashboard/safety" className="hover:text-bio-teal transition-colors">Safety Routes</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-text-primary font-display">Company</h4>
          <ul className="space-y-2 text-sm text-text-muted font-body">
            <li><Link href="/about" className="hover:text-bio-teal transition-colors">About</Link></li>
            <li><Link href="/dashboard/architecture" className="hover:text-bio-teal transition-colors">Architecture</Link></li>
            <li><Link href="#" className="hover:text-bio-teal transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-bio-teal transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted font-body">
        <p>© {new Date().getFullYear()} HERA. All rights reserved.</p>
        <p>Designed with ❤️ for women&apos;s health.</p>
      </div>
    </footer>
  );
}
