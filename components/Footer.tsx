'use client';

import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#111110', borderTop: '4px solid #111110' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-10 mb-14">

          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: 'var(--neo-accent)', border: '2px solid var(--neo-white)' }}
              >
                <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--neo-white)', letterSpacing: '-0.01em' }}>
                LETSFIT
              </span>
            </a>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)', maxWidth: '18rem', lineHeight: 1.65 }}>
              A student-focused wellness app for posture, movement, and consistent habits.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-14">
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--neo-white)', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                APP
              </h3>
              <ul className="space-y-3.5">
                {[
                  { label: 'Features', href: '/#features' },
                  { label: 'How it works', href: '/#progress' },
                  { label: 'Exercises', href: '/exercise' },
                ].map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--neo-white)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--neo-white)', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                ACCOUNT
              </h3>
              <ul className="space-y-3.5">
                {[
                  { label: 'Sign up', href: '/signup' },
                  { label: 'Log in', href: '/signin' },
                ].map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--neo-white)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8"
          style={{ borderTop: '2px solid rgba(255,255,255,0.12)' }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>
            © 2026 LetsFit. A student wellness project.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms'].map(l => (
              <a
                key={l}
                href="#"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
