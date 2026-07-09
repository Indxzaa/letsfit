'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Loader2, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { validateAvatarFile, uploadAvatarBlob } from '@/lib/profilePicture';

interface CropState {
  x: number; y: number; zoom: number;
}

interface ProfilePictureModalProps {
  userId: string;
  currentPhotoUrl: string | null;
  letter: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export function ProfilePictureModal({ userId, currentPhotoUrl, letter, onSave, onClose }: ProfilePictureModalProps) {
  const [imageSrc, setImageSrc]   = useState<string | null>(null);
  const [crop, setCrop]           = useState<CropState>({ x: 0, y: 0, zoom: 1 });
  const [dragging, setDragging]   = useState(false);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, cx: 0, cy: 0 });
  const [error, setError]         = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]         = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const PREVIEW   = 240; // preview canvas px

  // Draw circle-cropped preview whenever image/crop changes
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imgRef.current;
    if (!img) return;

    const { zoom, x, y } = crop;
    const dim = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    // Centre offset + user drag offset (in image space)
    const baseX = (img.naturalWidth - dim) / 2;
    const baseY = (img.naturalHeight - dim) / 2;
    const sx = baseX - x * (dim / PREVIEW);
    const sy = baseY - y * (dim / PREVIEW);

    ctx.clearRect(0, 0, PREVIEW, PREVIEW);
    // Circle clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(PREVIEW / 2, PREVIEW / 2, PREVIEW / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, sx, sy, dim, dim, 0, 0, PREVIEW, PREVIEW);
    ctx.restore();
    // Circle border
    ctx.beginPath();
    ctx.arc(PREVIEW / 2, PREVIEW / 2, PREVIEW / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [imageSrc, crop]);

  const loadFile = useCallback((f: File) => {
    const err = validateAvatarFile(f);
    if (err) { setError(err); return; }
    setError(null);
    setSaved(false);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImageSrc(url);
      setCrop({ x: 0, y: 0, zoom: 1 });
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }, [loadFile]);

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setDragging(true);
    setDragStart({ mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setCrop(c => ({
      ...c,
      x: dragStart.cx + (e.clientX - dragStart.mx),
      y: dragStart.cy + (e.clientY - dragStart.my),
    }));
  };
  const onMouseUp = () => setDragging(false);

  const handleSave = async () => {
    if (!canvasRef.current || !imageSrc) return;
    setUploading(true);
    setError(null);

    // Export full 256×256 version
    const out = document.createElement('canvas');
    out.width = 256; out.height = 256;
    const outCtx = out.getContext('2d')!;
    const img = imgRef.current!;
    const { zoom, x, y } = crop;
    const dim = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    const baseX = (img.naturalWidth - dim) / 2;
    const baseY = (img.naturalHeight - dim) / 2;
    outCtx.drawImage(img, baseX - x * (dim / PREVIEW), baseY - y * (dim / PREVIEW), dim, dim, 0, 0, 256, 256);

    const blob = await new Promise<Blob | null>(res => out.toBlob(res, 'image/webp', 0.9));
    if (!blob) { setUploading(false); setError('Could not process image.'); return; }

    const result = await uploadAvatarBlob(userId, blob);
    setUploading(false);
    if (!result.ok) { setError(result.error); return; }
    setSaved(true);
    onSave(result.url);
    setTimeout(onClose, 900);
  };

  return (
    <AnimatePresence>
      <motion.div key="pp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
        <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 12 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{ width: '100%', maxWidth: 400, background: 'var(--neo-white)', border: '3px solid var(--neo-black)', boxShadow: '6px 6px 0 var(--neo-black)', borderRadius: 0 }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '3px solid var(--neo-black)', background: 'var(--neo-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-2">
              <Camera size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest">Profile Picture</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><X size={14} strokeWidth={2.5} /></button>
          </div>

          <div className="p-5 flex flex-col items-center gap-4">
            {!imageSrc ? (
              <>
                {/* Current avatar preview */}
                <UserAvatar photoUrl={currentPhotoUrl} letter={letter} size="xl" />
                {/* Drop zone */}
                <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 py-5 cursor-pointer"
                  style={{ border: '3px dashed var(--neo-black)', background: 'var(--neo-surface)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg-blue)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--neo-surface)')}>
                  <Upload size={20} strokeWidth={2} style={{ color: 'var(--neo-accent)' }} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-app">Click or drag to upload</span>
                  <span className="text-[10px] text-subtle font-semibold uppercase tracking-wider">PNG · JPG · WEBP · max 5 MB</span>
                </div>
              </>
            ) : (
              <>
                {/* Crop preview */}
                <div className="text-[10px] font-bold uppercase tracking-widest text-subtle">Drag to reposition · Zoom to adjust</div>
                <canvas ref={canvasRef} width={PREVIEW} height={PREVIEW}
                  style={{ cursor: dragging ? 'grabbing' : 'grab', borderRadius: '50%', border: '3px solid var(--neo-black)', boxShadow: '3px 3px 0 var(--neo-black)', userSelect: 'none' }}
                  onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />

                {/* Zoom controls */}
                <div className="flex items-center gap-3 w-full">
                  <motion.button
                    onClick={() => setCrop(c => ({ ...c, zoom: Math.max(0.5, c.zoom - 0.1) }))}
                    whileHover={{ y: -1 }} whileTap={{ y: 1, scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 32, height: 32, border: '2px solid var(--neo-black)', background: 'var(--neo-surface)', boxShadow: '2px 2px 0 var(--neo-black)' }}>
                    <ZoomOut size={14} strokeWidth={2.5} />
                  </motion.button>
                  <input type="range" min={0.5} max={3} step={0.05} value={crop.zoom}
                    onChange={e => setCrop(c => ({ ...c, zoom: parseFloat(e.target.value) }))}
                    className="flex-1" />
                  <motion.button
                    onClick={() => setCrop(c => ({ ...c, zoom: Math.min(3, c.zoom + 0.1) }))}
                    whileHover={{ y: -1 }} whileTap={{ y: 1, scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 32, height: 32, border: '2px solid var(--neo-black)', background: 'var(--neo-surface)', boxShadow: '2px 2px 0 var(--neo-black)' }}>
                    <ZoomIn size={14} strokeWidth={2.5} />
                  </motion.button>
                  <motion.button
                    onClick={() => { setCrop({ x: 0, y: 0, zoom: 1 }); }}
                    title="Reset"
                    whileHover={{ y: -1 }} whileTap={{ y: 1, scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 32, height: 32, border: '2px solid var(--neo-black)', background: 'var(--neo-surface)', boxShadow: '2px 2px 0 var(--neo-black)' }}>
                    <RotateCcw size={13} strokeWidth={2.5} />
                  </motion.button>
                </div>

                <button onClick={() => { setImageSrc(null); imgRef.current = null; }}
                  className="text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  style={{ color: 'var(--text-subtle)', background: 'none', border: 'none' }}>
                  Choose different image
                </button>
              </>
            )}

            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
            {error && <p className="text-[11px] font-bold uppercase tracking-wider w-full" style={{ color: 'var(--neo-red)' }}>{error}</p>}
          </div>

          {/* Actions */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
            <motion.button
              onClick={handleSave} disabled={!imageSrc || uploading || saved}
              whileHover={imageSrc && !uploading && !saved ? { y: -2 } : undefined}
              whileTap={imageSrc && !uploading && !saved ? { y: 2, scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-black uppercase tracking-widest text-xs"
              style={{ background: saved ? '#22c55e' : 'var(--neo-accent)', border: '3px solid #000', boxShadow: (!imageSrc || uploading || saved) ? 'none' : '3px 3px 0 #000', color: '#fff', borderRadius: 0, opacity: (!imageSrc || uploading) && !saved ? 0.5 : 1, cursor: !imageSrc || uploading || saved ? 'not-allowed' : 'pointer' }}>
              {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> :
               saved    ? <><Check size={13} strokeWidth={3} /> Saved!</> :
                          <><Upload size={13} /> Save</>}
            </motion.button>
            <motion.button
              onClick={onClose}
              whileHover={{ y: -2 }} whileTap={{ y: 2, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex-1 py-3 font-display font-black uppercase tracking-widest text-xs cursor-pointer"
              style={{ background: 'var(--neo-surface)', border: '3px solid #000', boxShadow: '3px 3px 0 #000', borderRadius: 0 }}>
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
