interface GearIndicatorProps {
  gear: number;
}

export default function GearIndicator({ gear }: GearIndicatorProps) {
  return (
    <div className="text-center">
      <div className="text-[9px] uppercase text-f1-text-muted">Gear</div>
      <div className="font-mono text-2xl font-bold text-f1-text">
        {gear === 0 ? 'N' : gear}
      </div>
    </div>
  );
}
