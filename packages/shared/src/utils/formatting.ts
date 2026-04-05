export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null || typeof seconds !== 'number' || isNaN(seconds)) return '--:--.---';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
}

export function formatGap(gap: number | string | null | undefined): string {
  if (gap == null) return '---';
  const num = typeof gap === 'string' ? parseFloat(gap) : gap;
  if (isNaN(num)) return '---';
  if (num === 0) return 'LEADER';
  return `+${num.toFixed(3)}`;
}

export function formatInterval(interval: number | string | null | undefined): string {
  if (interval == null) return '---';
  const num = typeof interval === 'string' ? parseFloat(interval) : interval;
  if (isNaN(num)) return '---';
  return `+${num.toFixed(3)}`;
}
