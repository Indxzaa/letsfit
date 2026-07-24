'use client';

import { useState } from 'react';
import FitBotChat from './FitBotChat';

export default function FitBotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .fb-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #FFEB3B;
          border: 3px solid #000000;
          box-shadow: 4px 4px 0 #000000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: box-shadow 0.08s, transform 0.08s;
          outline: none;
        }

        .fb-btn:hover {
          box-shadow: 6px 6px 0 #000000;
          transform: translate(-2px, -2px);
        }

        .fb-btn:active {
          box-shadow: 2px 2px 0 #000000;
          transform: translate(2px, 2px);
        }

        .fb-btn--open {
          background: #000000;
        }

        .fb-panel {
          position: fixed;
          bottom: 92px;
          right: 24px;
          z-index: 9998;
          animation: fb-slide-in 0.15s ease-out;
        }

        @keyframes fb-slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile: wider panel, higher bottom to clear phone nav */
        @media (max-width: 520px) {
          .fb-btn {
            bottom: 80px;
            right: 16px;
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .fb-panel {
            bottom: 142px;
            right: 8px;
            left: 8px;
          }

          .fb-panel > * {
            max-width: 100% !important;
            width: 100% !important;
            height: 460px !important;
          }
        }
      `}</style>

      {open && (
        <div className="fb-panel">
          <FitBotChat />
        </div>
      )}

      <button
        className={`fb-btn${open ? ' fb-btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close FitBot' : 'Open FitBot'}
        title={open ? 'Close FitBot' : 'Ask FitBot'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFEB3B" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <circle cx="8.5" cy="10" r="1.2" fill="#000000" />
            <circle cx="15.5" cy="10" r="1.2" fill="#000000" />
          </svg>
        )}
      </button>
    </>
  );
}
