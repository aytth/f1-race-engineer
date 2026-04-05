interface DRSIndicatorProps {
  active: boolean;
}

export default function DRSIndicator({ active }: DRSIndicatorProps) {
  return (
    <div className="text-center">
      <div className="text-[9px] uppercase text-f1-text-muted">DRS</div>
      <div
        className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
          active
            ? 'bg-f1-green/20 text-f1-green glow-green'
            : 'bg-f1-bg-tertiary text-f1-text-muted'
        }`}
      >
        {active ? 'OPEN' : 'OFF'}
      </div>
    </div>
  );
}
