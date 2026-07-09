'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X, Check, Clock, Users } from 'lucide-react';
import type { UserSearchResult } from '@/types/social';

interface AddFriendModalProps {
  onSearch: (query: string) => Promise<{ data: UserSearchResult[]; error: string | null }>;
  onSendRequest: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  onAcceptRequest: (friendRowId: string) => Promise<{ ok: boolean; error?: string }>;
  onDeclineRequest: (friendRowId: string) => Promise<void>;
  onClose: () => void;
}

// Relationship badge / button for each of the 5 states
function RelationBadge({
  result,
  onSend,
  onAccept,
  onDecline,
  busy,
}: {
  result: UserSearchResult;
  onSend: () => void;
  onAccept: () => void;
  onDecline: () => void;
  busy: boolean;
}) {
  const { relation } = result;

  if (relation === 'friends') {
    return (
      <span
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
        style={{
          background: 'var(--card-bg-green)',
          border: '2px solid #000',
          color: 'var(--neo-black)',
        }}
      >
        <Check size={10} strokeWidth={3} />
        Friends
      </span>
    );
  }

  if (relation === 'pending_sent') {
    return (
      <span
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
        style={{
          background: '#FEF3C7',
          border: '2px solid #000',
          color: 'var(--neo-black)',
        }}
      >
        <Clock size={10} strokeWidth={3} />
        Pending
      </span>
    );
  }

  if (relation === 'pending_received') {
    return (
      <div className="flex items-center gap-1.5">
        <motion.button
          onClick={onAccept}
          disabled={busy}
          whileHover={!busy ? { y: -1 } : undefined}
          whileTap={!busy ? { y: 1, scale: 0.95 } : undefined}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
          style={{
            background: busy ? 'var(--neo-surface)' : 'var(--neo-accent)',
            border: '2px solid #000',
            boxShadow: busy ? 'none' : '2px 2px 0 #000',
            color: busy ? 'var(--neo-black)' : '#fff',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          <Check size={10} strokeWidth={3} />
          Accept
        </motion.button>
        <motion.button
          onClick={onDecline}
          disabled={busy}
          whileHover={!busy ? { y: -1 } : undefined}
          whileTap={!busy ? { y: 1, scale: 0.95 } : undefined}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
          style={{
            background: busy ? 'var(--neo-surface)' : '#FEE2E2',
            border: '2px solid #000',
            color: 'var(--neo-black)',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          <X size={10} strokeWidth={3} />
          Decline
        </motion.button>
      </div>
    );
  }

  // relation === 'none'
  return (
    <motion.button
      onClick={onSend}
      disabled={busy}
      whileHover={!busy ? { y: -1 } : undefined}
      whileTap={!busy ? { y: 1, scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
      style={{
        background: busy ? 'var(--neo-surface)' : 'var(--neo-blue)',
        border: '2px solid #000',
        boxShadow: busy ? 'none' : '2px 2px 0 #000',
        color: busy ? 'var(--neo-black)' : '#fff',
        cursor: busy ? 'not-allowed' : 'pointer',
      }}
    >
      <UserPlus size={10} strokeWidth={3} />
      {busy ? '...' : 'Add'}
    </motion.button>
  );
}

export function AddFriendModal({
  onSearch,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onClose,
}: AddFriendModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

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

  const setBusy = (id: string, on: boolean) => setBusyIds(prev => {
    const next = new Set(prev);
    on ? next.add(id) : next.delete(id);
    return next;
  });

  const updateResultRelation = (id: string, patch: Partial<UserSearchResult>) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const handleSend = useCallback(async (result: UserSearchResult) => {
    setBusy(result.id, true);
    const res = await onSendRequest(result.id);
    setBusy(result.id, false);
    if (res.ok) {
      updateResultRelation(result.id, { relation: 'pending_sent' });
    }
  }, [onSendRequest]);

  const handleAccept = useCallback(async (result: UserSearchResult) => {
    if (!result.friendRowId) return;
    setBusy(result.id, true);
    const res = await onAcceptRequest(result.friendRowId);
    setBusy(result.id, false);
    if (res.ok) {
      updateResultRelation(result.id, { relation: 'friends' });
    }
  }, [onAcceptRequest]);

  const handleDecline = useCallback(async (result: UserSearchResult) => {
    if (!result.friendRowId) return;
    setBusy(result.id, true);
    await onDeclineRequest(result.friendRowId);
    setBusy(result.id, false);
    updateResultRelation(result.id, { relation: 'none', friendRowId: null });
  }, [onDeclineRequest]);

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
              <Users size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest">Find Friends</span>
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
          <div style={{ minHeight: 80, maxHeight: 320, overflowY: 'auto' }}>
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
                <div style={{
                  width: 32, height: 32,
                  background: r.relation === 'friends' ? 'var(--neo-accent)' : 'var(--neo-blue)',
                  border: '3px solid #000', boxShadow: '2px 2px 0 #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span className="font-display text-xs font-black text-white">{r.username[0]?.toUpperCase()}</span>
                </div>
                <span className="font-display text-sm font-black uppercase flex-1 text-app truncate">{r.username}</span>
                <RelationBadge
                  result={r}
                  busy={busyIds.has(r.id)}
                  onSend={() => handleSend(r)}
                  onAccept={() => handleAccept(r)}
                  onDecline={() => handleDecline(r)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
