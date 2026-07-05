'use client';

export default function Footer() {
  return (
    <footer style={{ background: '#111110', borderTop: '4px solid #111110' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgb(255, 255, 255)', lineHeight: 1.6 }}>
            © 2026 LetsFit. Built by Mintra Cholatan (Team Leader &amp; Web Developer), Korawich Borisut (Collaborator), and Thapana Wongthep (Collaborator).
          </p>
          <div className="flex items-center gap-5 shrink-0">
            {['Privacy', 'Terms'].map(l => (
              <a
                key={l}
                href="#"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgb(255, 255, 255)' }}
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
