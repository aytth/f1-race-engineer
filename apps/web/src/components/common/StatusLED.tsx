interface StatusLEDProps {
  active: boolean;
  label?: string;
}

export default function StatusLED({ active, label }: StatusLEDProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${
          active
            ? 'bg-f1-green animate-pulse-glow'
            : 'bg-f1-text-muted'
        }`}
      />
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-f1-text-secondary">
          {label}
        </span>
      )}
    </div>
  );
}
