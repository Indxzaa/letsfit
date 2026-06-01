'use client';

import { Activity } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    Product: ['Features', 'How it works', 'Progress', 'FAQ'],
    Company: ['About', 'Mission', 'Contact'],
    Resources: ['Guides', 'Posture basics', 'Student wellness'],
    Legal: ['Privacy', 'Terms'],
  };

  return (
    <footer className="relative border-t border-app mt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-app" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold tracking-tight text-app">
                LetsFit
              </span>
            </a>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              A student-focused wellness app for posture, movement, and
              consistent habits.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-app mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted hover:text-app transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-app flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-subtle">
            © 2026 LetsFit. A student wellness project.
          </p>
          <div className="flex items-center gap-5 text-xs text-subtle">
            <a href="#" className="hover:text-app transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-app transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-app transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
