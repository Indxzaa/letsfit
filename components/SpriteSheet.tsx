'use client';
import { useEffect, useState } from 'react';

export type SpriteAnimDef = { row: number; frames: number; fps: number };

type Props = {
  src: string;
  sheetW: number; sheetH: number;
  frameW: number; frameH: number;
  anim: SpriteAnimDef;
  displayW: number; displayH: number;
  className?: string;
  style?: React.CSSProperties;
};

export function SpriteSheet({ src, sheetW, sheetH, frameW, frameH, anim, displayW, displayH, className, style }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    const id = setInterval(() => setFrame(f => (f + 1) % anim.frames), 1000 / anim.fps);
    return () => clearInterval(id);
  }, [anim]);

  const cols = sheetW / frameW;
  const rows = sheetH / frameH;

  return (
    <div
      className={className}
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url('${encodeURI(src)}')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `-${frame * displayW}px -${anim.row * displayH}px`,
        backgroundSize: `${cols * displayW}px ${rows * displayH}px`,
        imageRendering: 'pixelated',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
