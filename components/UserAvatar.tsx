'use client';

import Image from 'next/image';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const DIMS: Record<Size, { px: number; text: string }> = {
  sm: { px: 28,  text: 'text-xs' },
  md: { px: 40,  text: 'text-base' },
  lg: { px: 64,  text: 'text-2xl' },
  xl: { px: 96,  text: 'text-4xl' },
};

interface UserAvatarProps {
  /** URL from Supabase Storage (null shows letter fallback) */
  photoUrl?: string | null;
  /** Fallback letter — first char of username or email */
  letter?: string;
  size?: Size;
  /** Extra className on the outer wrapper */
  className?: string;
}

export default function UserAvatar({
  photoUrl,
  letter = '?',
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const { px, text } = DIMS[size];
  const dim = `${px}px`;

  const sharedStyle: React.CSSProperties = {
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
    background: photoUrl ? '#000' : 'var(--neo-accent)',
  };

  return (
    <div className={`inline-flex ${className}`} style={sharedStyle}>
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt="Profile"
          width={px}
          height={px}
          className="w-full h-full object-cover"
          style={{ borderRadius: '50%' }}
          unoptimized
        />
      ) : (
        <span
          className={`font-display font-black text-white uppercase select-none ${text}`}
          aria-hidden
        >
          {letter.charAt(0)}
        </span>
      )}
    </div>
  );
}
