export default function LoadingPulse({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 h-8 bg-f1-red rounded-full"
            style={{
              animation: `pulse-glow 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-sm text-f1-text-secondary">{text}</p>
    </div>
  );
}
