'use client';

import { getShopItem, RARITY_CONFIG } from '@/lib/shop';
import { getTitle } from '@/lib/titles';
import type { Progress } from '@/lib/progress';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { box: string; text: string; pad: string; aura: string }> = {
  sm: { box: 'w-7 h-7',   text: 'text-base', pad: 'p-[2px]', aura: '-inset-1.5 blur-sm' },
  md: { box: 'w-10 h-10', text: 'text-xl',   pad: 'p-[2px]', aura: '-inset-2 blur-md' },
  lg: { box: 'w-16 h-16', text: 'text-3xl',  pad: 'p-[3px]', aura: '-inset-3 blur-lg' },
  xl: { box: 'w-24 h-24', text: 'text-5xl',  pad: 'p-[4px]', aura: '-inset-4 blur-xl' },
};

function getBorderClass(value: string, pad: string): string {
  const base = `${pad} rounded-full`;
  const map: Record<string, string> = {
    neon: 'ba-neon', crystal: 'ba-crystal', royal: 'ba-royal',
    flame: 'ba-flame', galaxy: 'ba-galaxy', electric: 'ba-electric', floral: 'ba-floral',
  };
  return map[value] ? `${base} ${map[value]}` : '';
}

export default function UserAvatar({
  progress,
  size = 'md',
}: {
  progress: Progress | null;
  size?: Size;
  showBadge?: boolean;
}) {
  const equipped = progress?.equippedItems ?? {};
  const avatarItem = getShopItem(equipped.avatar ?? 'avatar-default');
  const borderItem = getShopItem(equipped.border ?? 'border-none');
  const auraItem   = getShopItem(equipped.aura   ?? 'aura-none');
  const earnedTitle = getTitle(equipped.title ?? '');

  const avatarChar  = avatarItem?.value || '🙂';
  const borderValue = borderItem?.value ?? 'none';
  const titleText   = earnedTitle?.value ?? '';
  const auraValue   = auraItem?.value    ?? '';

  const dim       = SIZES[size];
  const wrapClass = getBorderClass(borderValue, dim.pad);
  const hasBorder = !!wrapClass;

  const titleColor = RARITY_CONFIG[earnedTitle?.rarity ?? 'common'].color;

  const inner = (
    <div className={`${dim.box} rounded-full flex items-center justify-center ${dim.text} ${hasBorder ? 'bg-[var(--surface-solid)]' : 'bg-[var(--accent)]/15'}`}>
      <span aria-hidden>{avatarChar}</span>
    </div>
  );

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      {titleText && size !== 'sm' && (
        <div
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-tight"
          style={{ color: titleColor, background: `${titleColor}22` }}
        >
          {titleText}
        </div>
      )}
      <div className="relative inline-flex items-center justify-center">
        {auraValue && size !== 'sm' && (
          <div className={`absolute ${dim.aura} rounded-full aura-${auraValue} pointer-events-none`} aria-hidden />
        )}
        {hasBorder ? <div className={wrapClass}>{inner}</div> : inner}
      </div>
    </div>
  );
}
