'use client';

import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-app mt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-10">
          <div>
            <a href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl accent-bg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold text-app">LetsFit</span>
            </a>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              A student-focused wellness app for posture, movement, and consistent habits.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h3 className="text-xs font-semibold text-app uppercase tracking-wider mb-4">App</h3>
              <ul className="space-y-2.5">
                <li><Link href="/#features" className="text-sm text-muted hover:text-app transition-colors">Features</Link></li>
                <li><Link href="/#progress" className="text-sm text-muted hover:text-app transition-colors">How it works</Link></li>
                <li><Link href="/exercise" className="text-sm text-muted hover:text-app transition-colors">Exercises</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-app uppercase tracking-wider mb-4">Account</h3>
              <ul className="space-y-2.5">
                <li><Link href="/signup" className="text-sm text-muted hover:text-app transition-colors">Sign up</Link></li>
                <li><Link href="/signin" className="text-sm text-muted hover:text-app transition-colors">Log in</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-app flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-subtle">© 2026 LetsFit. A student wellness project.</p>
          <div className="flex items-center gap-5 text-xs text-subtle">
            <a href="#" className="hover:text-app transition-colors">Privacy</a>
            <a href="#" className="hover:text-app transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
