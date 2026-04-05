import { COMPOUND_COLORS, COMPOUND_SHORT } from '@f1/shared';

interface BadgeProps {
  compound: string;
  size?: 'sm' | 'md';
}

export default function Badge({ compound, size = 'sm' }: BadgeProps) {
  const color = COMPOUND_COLORS[compound] || '#888';
  const letter = COMPOUND_SHORT[compound] || '?';
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-xs';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold font-mono border-2`}
      style={{ borderColor: color, color: color }}
    >
      {letter}
    </div>
  );
}
