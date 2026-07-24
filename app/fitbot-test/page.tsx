'use client';

import { useState } from 'react';

export default function FitBotTestPage() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!message.trim()) return;
    setLoading(true);
    setReply('');
    setError('');
    try {
      const res = await fetch('/api/fitbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.reply) {
        setReply(data.reply);
      } else {
        setError(data.error ?? 'Unknown error');
      }
    } catch {
      setError('Request failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;600;700&display=swap');

        :root {
          --neo-black: #000000;
          --neo-white: #FFFFFF;
          --neo-cream: #F5F0E6;
          --neo-yellow: #FFEB3B;
          --neo-pink: #FF4081;
          --neo-red: #FF5252;
          --neo-green: #4CAF50;
          --font-display: 'Archivo Black', Impact, sans-serif;
          --font-body: 'Space Grotesk', Arial, sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: var(--neo-cream);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 16px;
          font-family: var(--font-body);
        }

        .card {
          background: var(--neo-white);
          border: 3px solid var(--neo-black);
          box-shadow: 6px 6px 0 var(--neo-black);
          width: 100%;
          max-width: 640px;
          overflow: hidden;
        }

        .card-header {
          background: var(--neo-black);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .badge {
          background: var(--neo-yellow);
          border: 2px solid var(--neo-black);
          color: var(--neo-black);
          font-family: var(--font-display);
          font-size: 0.7rem;
          padding: 3px 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          color: var(--neo-white);
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }

        .card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        label {
          font-family: var(--font-display);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 6px;
        }

        textarea {
          width: 100%;
          border: 3px solid var(--neo-black);
          background: var(--neo-white);
          padding: 12px 14px;
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          min-height: 110px;
          outline: none;
          transition: box-shadow 0.1s;
          border-radius: 0;
        }

        textarea:focus {
          box-shadow: 4px 4px 0 var(--neo-black);
        }

        .hint {
          font-size: 0.8rem;
          color: #555;
          margin-top: 4px;
        }

        .send-btn {
          background: var(--neo-yellow);
          color: var(--neo-black);
          border: 3px solid var(--neo-black);
          box-shadow: 4px 4px 0 var(--neo-black);
          padding: 13px 24px;
          font-family: var(--font-display);
          font-size: 1rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: box-shadow 0.08s, transform 0.08s;
          align-self: flex-start;
          letter-spacing: 0.03em;
        }

        .send-btn:hover:not(:disabled) {
          box-shadow: 6px 6px 0 var(--neo-black);
          transform: translate(-2px, -2px);
        }

        .send-btn:active:not(:disabled) {
          box-shadow: 2px 2px 0 var(--neo-black);
          transform: translate(2px, 2px);
        }

        .send-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .divider {
          border: none;
          border-top: 3px solid var(--neo-black);
        }

        .reply-box {
          border: 3px solid var(--neo-black);
          background: var(--neo-cream);
          padding: 16px;
        }

        .reply-label {
          font-family: var(--font-display);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
          color: #333;
        }

        .reply-text {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.7;
          color: var(--neo-black);
          white-space: pre-wrap;
        }

        .error-box {
          border: 3px solid var(--neo-red);
          background: #fff5f5;
          padding: 14px 16px;
          box-shadow: 4px 4px 0 var(--neo-red);
        }

        .error-label {
          font-family: var(--font-display);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--neo-red);
          margin-bottom: 6px;
        }

        .error-text {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: #b91c1c;
        }

        .loading-dots span {
          animation: blink 1.2s infinite;
          font-size: 1.4rem;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="card-header">
            <span className="badge">Test</span>
            <span className="card-title">FitBot API</span>
          </div>

          <div className="card-body">
            <div>
              <label htmlFor="msg-input">Your message</label>
              <textarea
                id="msg-input"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FitBot anything about fitness..."
              />
              <p className="hint">Ctrl + Enter to send</p>
            </div>

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={loading || !message.trim()}
            >
              {loading ? 'Sending...' : '→ Send'}
            </button>

            {loading && (
              <>
                <hr className="divider" />
                <div className="reply-box">
                  <div className="reply-label">FitBot is thinking</div>
                  <div className="loading-dots">
                    <span>●</span><span>●</span><span>●</span>
                  </div>
                </div>
              </>
            )}

            {error && !loading && (
              <>
                <hr className="divider" />
                <div className="error-box">
                  <div className="error-label">Error</div>
                  <div className="error-text">{error}</div>
                </div>
              </>
            )}

            {reply && !loading && (
              <>
                <hr className="divider" />
                <div className="reply-box">
                  <div className="reply-label">FitBot reply</div>
                  <div className="reply-text">{reply}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
