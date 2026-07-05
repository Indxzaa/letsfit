'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X } from 'lucide-react';
import type { InviteWithSender } from '@/types/social';

interface InvitePopupProps {
  invite: InviteWithSender;
  onAccept: () => Promise<void> | void;
  onDecline: () => Promise<void> | void;
}

export function InvitePopup({ invite, onAccept, onDecline }: InvitePopupProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="invite-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
      >
        <motion.div
          initial={{ scale: 0.88, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{
            width: 320,
            background: 'var(--neo-white)',
            border: '3px solid var(--neo-black)',
            boxShadow: '6px 6px 0 var(--neo-accent)',
            borderRadius: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: '3px solid var(--neo-black)',
              background: 'var(--neo-accent)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div className="flex items-center gap-2">
              <Swords size={16} color="#fff" strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                Workout Invite
              </span>
            </div>
            <button
              onClick={onDecline}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 2 }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--neo-blue)',
                  border: '3px solid var(--neo-black)',
                  boxShadow: '2px 2px 0 var(--neo-black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="font-display text-lg font-black text-white">
                  {invite.sender_username[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <p className="font-display text-sm font-black uppercase text-app">
                  {invite.sender_username}
                </p>
                <p className="text-xs text-muted mt-0.5">invited you to workout together</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onAccept}
                className="neo-btn neo-btn-primary w-full"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Swords size={14} strokeWidth={2.5} />
                Accept
              </button>
              <button
                onClick={onDecline}
                className="neo-btn neo-btn-ghost w-full"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
