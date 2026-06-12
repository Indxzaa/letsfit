'use client';

import { getShopItem, RARITY_CONFIG } from '@/lib/shop';
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
  if (value === 'prismatic' || value === 'gradient') return `${base} ba-prismatic`;
  if (value === 'cosmic')                            return `${base} ba-cosmic`;
  if (value === 'gold'    || value === 'strong')     return `${base} ba-gold`;
  if (value === 'silver'  || value === 'soft')       return `${base} ba-silver`;
  return '';
}

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
  const badgeItem  = getShopItem(equipped.badge  ?? 'badge-none');
  const titleItem  = getShopItem(equipped.title  ?? 'title-none');
  const auraItem   = getShopItem(equipped.aura   ?? 'aura-none');

  const avatarChar  = avatarItem?.value || '🙂';
  const borderValue = borderItem?.value ?? 'none';
  const badgeText   = badgeItem?.value  ?? '';
  const titleText   = titleItem?.value  ?? '';
  const auraValue   = auraItem?.value   ?? '';

  const dim        = SIZES[size];
  const wrapClass  = getBorderClass(borderValue, dim.pad);
  const hasBorder  = !!wrapClass;

  const badgeColor = RARITY_CONFIG[badgeItem?.rarity ?? 'common'].color;
  const titleColor = RARITY_CONFIG[titleItem?.rarity ?? 'common'].color;

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
      {showBadge && badgeText && (
        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
          style={{ color: badgeColor, background: `${badgeColor}22` }}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
}
