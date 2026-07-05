'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X, Check } from 'lucide-react';

interface SearchResult {
  id: string;
  username: string;
  avatar: string | null;
}

interface AddFriendModalProps {
  onSearch: (query: string) => Promise<{ data: Array<{ id: string; username: string; avatar: string | null }>; error: string | null }>;
  onSendRequest: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  onClose: () => void;
}

export function AddFriendModal({ onSearch, onSendRequest, onClose }: AddFriendModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    setSearchError(null);
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const res = await onSearch(q);
    setResults(res.data);
    if (res.error) setSearchError(res.error);
    setSearching(false);
  }, [onSearch]);

  const handleSend = useCallback(async (userId: string) => {
    const result = await onSendRequest(userId);
    if (result.ok) {
      setSent(prev => new Set(prev).add(userId));
    } else {
      setErrors(prev => ({ ...prev, [userId]: result.error ?? 'Failed' }));
    }
  }, [onSendRequest]);

  return (
    <AnimatePresence>
      <motion.div
        key="add-friend-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 12 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{
            width: '100%',
            maxWidth: 384,
            background: 'var(--neo-white)',
            border: '3px solid var(--neo-black)',
            boxShadow: '6px 6px 0 var(--neo-black)',
            borderRadius: 0,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '3px solid var(--neo-black)', background: 'var(--neo-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-2">
              <UserPlus size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest">Add Friend</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Search input */}
          <div style={{ padding: '14px 16px', borderBottom: '3px solid var(--neo-black)' }}>
            <div className="relative">
              <Search size={14} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                className="neo-input w-full"
                style={{ paddingLeft: 32 }}
                placeholder="Search by username..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div style={{ minHeight: 80, maxHeight: 280, overflowY: 'auto' }}>
            {searching && (
              <div className="p-4 text-center">
                <span className="text-xs text-subtle font-semibold uppercase tracking-wider">Searching...</span>
              </div>
            )}
            {!searching && searchError && (
              <div className="p-4 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--neo-red)' }}>
                  Search failed — check console
                </span>
              </div>
            )}
            {!searching && !searchError && query.length >= 2 && results.length === 0 && (
              <div className="p-4 text-center">
                <span className="text-xs text-subtle font-semibold uppercase tracking-wider">No users found</span>
              </div>
            )}
            {!searching && results.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < results.length - 1 ? '2px solid var(--neo-black)' : 'none' }}
              >
                <div style={{ width: 32, height: 32, background: 'var(--neo-blue)', border: '3px solid #000', boxShadow: '2px 2px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="font-display text-xs font-black text-white">{r.username[0]?.toUpperCase()}</span>
                </div>
                <span className="font-display text-sm font-black uppercase flex-1 text-app truncate">{r.username}</span>
                {sent.has(r.id) ? (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-subtle">
                    <Check size={11} strokeWidth={3} /> Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleSend(r.id)}
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
                    style={{ background: 'var(--neo-accent)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', color: '#fff', cursor: 'pointer' }}
                  >
                    {errors[r.id] ? 'Retry' : 'Add'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
