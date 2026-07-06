'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Loader2, Check } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { uploadAvatar, validateAvatarFile } from '@/lib/profilePicture';

interface ProfilePictureModalProps {
  userId: string;
  currentPhotoUrl: string | null;
  letter: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export function ProfilePictureModal({
  userId,
  currentPhotoUrl,
  letter,
  onSave,
  onClose,
}: ProfilePictureModalProps) {
  const [preview, setPreview]   = useState<string | null>(currentPhotoUrl);
  const [file, setFile]         = useState<File | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const err = validateAvatarFile(f);
    if (err) { setError(err); return; }
    setError(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleSave = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const result = await uploadAvatar(userId, file);
    setUploading(false);
    if (!result.ok) { setError(result.error); return; }
    setSaved(true);
    onSave(result.url);
    setTimeout(onClose, 900);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="pp-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 12 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{
            width: '100%', maxWidth: 360,
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
              <Camera size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest">Profile Picture</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center gap-4 p-6">
            <UserAvatar photoUrl={preview} letter={letter} size="xl" />

            {/* Drop zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 py-5 cursor-pointer"
              style={{
                border: '3px dashed var(--neo-black)',
                background: 'var(--neo-surface)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg-blue)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--neo-surface)')}
            >
              <Upload size={20} strokeWidth={2} style={{ color: 'var(--neo-accent)' }} />
              <span className="text-[11px] font-black uppercase tracking-widest text-app">
                Click or drag to upload
              </span>
              <span className="text-[10px] text-subtle font-semibold uppercase tracking-wider">
                PNG · JPG · WEBP · max 5 MB
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleChange}
            />

            {error && (
              <p className="text-[11px] font-bold uppercase tracking-wider w-full"
                style={{ color: 'var(--neo-red)' }}>{error}</p>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={!file || uploading || saved}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-black uppercase tracking-widest text-xs cursor-pointer"
              style={{
                background: saved ? '#22c55e' : 'var(--neo-accent)',
                border: '3px solid #000',
                boxShadow: (!file || uploading || saved) ? 'none' : '3px 3px 0 #000',
                color: '#fff',
                borderRadius: 0,
                opacity: (!file || uploading) && !saved ? 0.5 : 1,
                cursor: !file || uploading || saved ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> :
               saved    ? <><Check size={13} strokeWidth={3} /> Saved!</> :
                          <><Upload size={13} /> Save</>}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 font-display font-black uppercase tracking-widest text-xs cursor-pointer"
              style={{ background: 'var(--neo-surface)', border: '3px solid #000', borderRadius: 0 }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
