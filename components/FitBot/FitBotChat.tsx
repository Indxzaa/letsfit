'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

const GREETING: Message = {
  role: 'bot',
  text: "สวัสดีครับ ข้อยแม่น FitBot โค้ชฟิตเนส AI ของเจ้าเด้อ อยากฮู้เรื่องการออกกำลังกาย ท่าทาง หรือเป้าหมายฟิตเนสอีหยัง ถามมาได้เลยเด้อ.",
};

export default function FitBotChat() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/fitbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setError(data.error ?? 'FitBot could not respond. Try again.');
      }
    } catch {
      setError('Request failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{`
        .fbc-wrap {
          display: flex;
          flex-direction: column;
          width: min(340px, calc(100vw - 48px));
          height: min(500px, calc(100vh - 180px));
          background: #FFFFFF;
          border: 3px solid #000000;
          box-shadow: 6px 6px 0 #000000;
          font-family: 'Space Grotesk', Arial, sans-serif;
          overflow: hidden;
        }

        .fbc-header {
          background: #000000;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .fbc-avatar {
          width: 32px;
          height: 32px;
          background: #FFEB3B;
          border: 2px solid #FFEB3B;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .fbc-title {
          font-family: 'Archivo Black', Impact, sans-serif;
          font-size: 1.1rem;
          color: #FFFFFF;
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }

        .fbc-subtitle {
          font-size: 0.7rem;
          color: #888;
          margin-top: 1px;
        }

        .fbc-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #F5F0E6;
        }

        .fbc-messages::-webkit-scrollbar {
          width: 4px;
        }
        .fbc-messages::-webkit-scrollbar-track {
          background: #F5F0E6;
        }
        .fbc-messages::-webkit-scrollbar-thumb {
          background: #000000;
        }

        .fbc-bubble {
          max-width: 80%;
          padding: 10px 14px;
          font-size: 0.92rem;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .fbc-bubble--bot {
          align-self: flex-start;
          background: #FFFFFF;
          border: 2px solid #000000;
          box-shadow: 3px 3px 0 #000000;
          color: #000000;
        }

        .fbc-bubble--user {
          align-self: flex-end;
          background: #FFEB3B;
          border: 2px solid #000000;
          box-shadow: 3px 3px 0 #000000;
          color: #000000;
          font-weight: 600;
        }

        .fbc-label {
          font-family: 'Archivo Black', Impact, sans-serif;
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
          color: #555;
        }

        .fbc-label--user {
          text-align: right;
        }

        .fbc-row {
          display: flex;
          flex-direction: column;
        }

        .fbc-row--user {
          align-items: flex-end;
        }

        .fbc-row--bot {
          align-items: flex-start;
        }

        .fbc-typing {
          align-self: flex-start;
          background: #FFFFFF;
          border: 2px solid #000000;
          box-shadow: 3px 3px 0 #000000;
          padding: 10px 16px;
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .fbc-dot {
          width: 7px;
          height: 7px;
          background: #000000;
          border-radius: 50%;
          animation: fbc-blink 1.2s infinite;
        }
        .fbc-dot:nth-child(2) { animation-delay: 0.2s; }
        .fbc-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes fbc-blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }

        .fbc-error {
          align-self: stretch;
          background: #fff5f5;
          border: 2px solid #FF5252;
          box-shadow: 3px 3px 0 #FF5252;
          padding: 10px 14px;
          font-size: 0.85rem;
          color: #b91c1c;
        }

        .fbc-input-row {
          display: flex;
          border-top: 3px solid #000000;
          flex-shrink: 0;
        }

        .fbc-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 13px 16px;
          font-family: 'Space Grotesk', Arial, sans-serif;
          font-size: 0.95rem;
          background: #FFFFFF;
          color: #000000;
        }

        .fbc-input::placeholder {
          color: #888;
        }

        .fbc-send {
          background: #FFEB3B;
          border: none;
          border-left: 3px solid #000000;
          padding: 0 20px;
          font-family: 'Archivo Black', Impact, sans-serif;
          font-size: 0.85rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.08s, transform 0.08s;
          color: #000000;
          letter-spacing: 0.03em;
          flex-shrink: 0;
        }

        .fbc-send:hover:not(:disabled) {
          background: #000000;
          color: #FFEB3B;
        }

        .fbc-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="fbc-wrap">
        <div className="fbc-header">
          <div className="fbc-avatar">🤖</div>
          <div>
            <div className="fbc-title">FitBot</div>
            <div className="fbc-subtitle">ช่วยอิหยัง</div>
          </div>
        </div>

        <div className="fbc-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`fbc-row fbc-row--${msg.role}`}>
              <div className="fbc-label fbc-label--${msg.role}">
                {msg.role === 'bot' ? 'FitBot' : 'You'}
              </div>
              <div className={`fbc-bubble fbc-bubble--${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="fbc-typing">
              <div className="fbc-dot" />
              <div className="fbc-dot" />
              <div className="fbc-dot" />
            </div>
          )}

          {error && !loading && (
            <div className="fbc-error">{error}</div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="fbc-input-row">
          <input
            className="fbc-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FitBot anything..."
            disabled={loading}
          />
          <button
            className="fbc-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
