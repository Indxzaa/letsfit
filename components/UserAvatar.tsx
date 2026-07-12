'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getShopItem } from '@/lib/shop';
import type { Progress } from '@/lib/progress';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const DIMS: Record<Size, { px: number; text: string; pad: string; aura: string }> = {
  sm: { px: 28,  text: 'text-xs',   pad: 'p-[2px]', aura: '-inset-1.5 blur-sm' },
  md: { px: 40,  text: 'text-base', pad: 'p-[2px]', aura: '-inset-2 blur-md' },
  lg: { px: 64,  text: 'text-2xl',  pad: 'p-[3px]', aura: '-inset-3 blur-lg' },
  xl: { px: 96,  text: 'text-4xl',  pad: 'p-[4px]', aura: '-inset-4 blur-xl' },
};

const BORDER_MAP: Record<string, string> = {
  neon: 'ba-neon', crystal: 'ba-crystal', royal: 'ba-royal',
  flame: 'ba-flame', galaxy: 'ba-galaxy', electric: 'ba-electric', floral: 'ba-floral',
};

// How many px the frame image extends beyond the avatar circle on each side
const FRAME_INSET: Record<Size, number> = {
  sm: -5,
  md: -7,
  lg: -11,
  xl: -16,
};

interface UserAvatarProps {
  photoUrl?: string | null;
  letter?: string;
  size?: Size;
  progress?: Progress | null;
  className?: string;
}

export default function UserAvatar({
  photoUrl,
  letter = '?',
  size = 'md',
  progress,
  className = '',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const equipped   = progress?.equippedItems ?? {};
  const borderItem = getShopItem(equipped.border ?? 'border-none');
  const auraItem   = getShopItem(equipped.aura   ?? 'aura-none');
  const frameItem  = getShopItem(equipped.frame  ?? 'frame-none');

  const borderValue = borderItem?.value ?? 'none';
  const auraValue   = auraItem?.value   ?? '';
  const frameValue  = (frameItem?.value && frameItem.id !== 'frame-none') ? frameItem.value : null;
  const hasBorder   = !!BORDER_MAP[borderValue];
  const borderClass = hasBorder ? `${DIMS[size].pad} rounded-full ${BORDER_MAP[borderValue]}` : '';

  const { px, text, aura } = DIMS[size];
  const dim = `${px}px`;
  const showPhoto = !!(photoUrl && !imgError);

  const circleStyle: React.CSSProperties = {
    width: dim,
    height: dim,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--neo-black)',
    boxShadow: '2px 2px 0 var(--neo-black)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: showPhoto ? '#000' : 'var(--neo-accent)',
  };

  const inner = (
    <div style={circleStyle}>
      {showPhoto ? (
        <Image
          src={photoUrl!}
          alt="Profile"
          width={px}
          height={px}
          className="w-full h-full object-cover"
          style={{ borderRadius: '50%' }}
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`font-display font-black text-white uppercase select-none ${text}`} aria-hidden>
          {letter.charAt(0)}
        </span>
      )}
    </div>
  );

  const frameInset = FRAME_INSET[size];

  return (
    <div className={`inline-flex relative ${className}`}>
      {/* Aura (hidden at sm) */}
      {auraValue && size !== 'sm' && (
        <div className={`absolute ${aura} rounded-full aura-${auraValue} pointer-events-none`} aria-hidden />
      )}
      {/* Border wrapper or bare circle */}
      {hasBorder ? <div className={borderClass}>{inner}</div> : inner}
      {/* Frame overlay — renders on top, extends beyond the circle */}
      {frameValue && (
        <div
          style={{
            position: 'absolute',
            inset: frameInset,
            pointerEvents: 'none',
            zIndex: 10,
          }}
          aria-hidden
        >
          <Image src={frameValue} alt="" fill className="object-contain" unoptimized />
        </div>
      )}
    </div>
  );
}
