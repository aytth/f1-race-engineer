import { useReplayStore } from '../../stores/replayStore';

const SPEEDS = [1, 2, 5, 10];

export default function PlaybackControls() {
  const { isReplayMode, playing, speed, currentLap, totalLaps, setPlaying, setSpeed, setCurrentLap, prevLap, nextLap } = useReplayStore();

  if (!isReplayMode || totalLaps === 0) return null;

  const progress = totalLaps > 0 ? ((currentLap - 1) / (totalLaps - 1)) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-f1-bg-secondary/80 border-t border-f1-border shrink-0">
      {/* Play/Pause */}
      <button
        onClick={() => setPlaying(!playing)}
        className="w-8 h-8 flex items-center justify-center rounded bg-f1-bg-tertiary hover:bg-f1-bg-elevated text-f1-text transition-colors"
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="3.5" height="12" rx="1" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.5v11l9-5.5z" />
          </svg>
        )}
      </button>

      {/* Previous lap */}
      <button
        onClick={prevLap}
        disabled={currentLap <= 1}
        className="text-f1-text-secondary hover:text-f1-text disabled:text-f1-text-muted transition-colors"
        title="Previous lap"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {/* Lap indicator */}
      <div className="flex items-center gap-1.5 min-w-[80px] justify-center">
        <span className="text-[9px] text-f1-text-muted uppercase">Lap</span>
        <span className="text-sm font-bold font-mono text-f1-text">
          {currentLap}
        </span>
        <span className="text-[10px] text-f1-text-muted font-mono">
          / {totalLaps}
        </span>
      </div>

      {/* Next lap */}
      <button
        onClick={nextLap}
        disabled={currentLap >= totalLaps}
        className="text-f1-text-secondary hover:text-f1-text disabled:text-f1-text-muted transition-colors"
        title="Next lap"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M4 1L9 6L4 11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {/* Progress bar / scrubber */}
      <div className="flex-1 mx-2">
        <input
          type="range"
          min={1}
          max={totalLaps}
          value={currentLap}
          onChange={(e) => setCurrentLap(Number(e.target.value))}
          className="w-full h-1 accent-f1-red cursor-pointer"
          style={{
            background: `linear-gradient(to right, #e10600 ${progress}%, #2a2a3a ${progress}%)`,
          }}
        />
      </div>

      {/* Speed selector */}
      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
              speed === s
                ? 'bg-f1-red text-white'
                : 'bg-f1-bg-tertiary text-f1-text-secondary hover:text-f1-text'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Replay indicator */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-f1-border">
        <div className={`w-2 h-2 rounded-full ${playing ? 'bg-f1-red animate-pulse-glow' : 'bg-f1-text-muted'}`} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-f1-text-secondary">
          {playing ? 'REPLAY' : 'PAUSED'}
        </span>
      </div>
    </div>
  );
}
