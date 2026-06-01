'use client';

import { getShopItem } from '@/lib/shop';
import type { Progress } from '@/lib/progress';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { box: string; text: string; ring: number }> = {
  sm: { box: 'w-7 h-7', text: 'text-base', ring: 2 },
  md: { box: 'w-10 h-10', text: 'text-xl', ring: 3 },
  lg: { box: 'w-16 h-16', text: 'text-3xl', ring: 4 },
  xl: { box: 'w-24 h-24', text: 'text-5xl', ring: 5 },
};

export default function UserAvatar({
  progress,
  size = 'md',
  showBadge = false,
}: {
  progress: Progress | null;
  size?: Size;
  showBadge?: boolean;
}) {
  const equipped = progress?.equippedItems ?? {};
  const avatarItem = getShopItem(equipped.avatar ?? 'avatar-default');
  const borderItem = getShopItem(equipped.border ?? 'border-none');
  const badgeItem = getShopItem(equipped.badge ?? 'badge-none');

  const avatarChar = avatarItem?.value || '🙂';
  const borderStyle = borderItem?.value ?? 'none';
  const badgeText = badgeItem?.value ?? '';

  const dim = SIZES[size];

  let ringClass = '';
  let extraStyle: React.CSSProperties = {};
  if (borderStyle === 'soft') {
    ringClass = `ring-${dim.ring} ring-[var(--accent)]/30`;
  } else if (borderStyle === 'strong') {
    ringClass = `ring-${dim.ring} ring-[var(--accent)]/70`;
  } else if (borderStyle === 'gradient') {
    extraStyle = {
      boxShadow: `0 0 0 ${dim.ring}px var(--accent), 0 0 0 ${dim.ring * 2}px var(--accent-soft)`,
    };
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`${dim.box} ${dim.text} rounded-full bg-[var(--accent)]/15 flex items-center justify-center ${ringClass}`}
        style={extraStyle}
      >
        <span aria-hidden>{avatarChar}</span>
      </div>
      {showBadge && badgeText && (
        <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white accent-bg whitespace-nowrap">
          {badgeText}
        </div>
      )}
    </div>
  );
}
