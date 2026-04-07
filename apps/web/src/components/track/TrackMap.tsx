import { useEffect, useState, useRef, useCallback } from 'react';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { fetchApi } from '../../lib/api';
import Panel from '../common/Panel';

interface TrackData {
  points: { x: number; y: number }[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

interface TrackMapProps {
  sessionKey: number;
}

export default function TrackMap({ sessionKey }: TrackMapProps) {
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [driverLocations, setDriverLocations] = useState<Record<string, { x: number; y: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDriver, setHoveredDriver] = useState<number | null>(null);
  const { state, selectedDriver, selectDriver } = useTelemetryStore();
  const locIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Performance: use refs for zoom/pan to avoid re-renders
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [zoomDisplay, setZoomDisplay] = useState(100);
  const trackDimsRef = useRef({ width: 0, height: 0, padding: 50 });
  const rafRef = useRef<number>(0);

  // Fetch track outline
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchApi<TrackData>(`/track/${sessionKey}`)
      .then(setTrackData)
      .catch((err) => {
        console.error('Track load error:', err);
        setError('Could not load track map');
      })
      .finally(() => setLoading(false));
  }, [sessionKey]);

  // Fetch driver locations periodically
  useEffect(() => {
    if (!trackData) return;
    const fetchLocations = async () => {
      try {
        const locs = await fetchApi<Record<string, { x: number; y: number }>>('/telemetry/locations', {
          session_key: String(sessionKey),
        });
        setDriverLocations(locs);
      } catch (err) {
        console.error('Location fetch error:', err);
      }
    };
    fetchLocations();
    locIntervalRef.current = setInterval(fetchLocations, 15000);
    return () => {
      if (locIntervalRef.current) clearInterval(locIntervalRef.current);
    };
  }, [sessionKey, trackData]);

  // Update SVG viewBox directly (no React re-render)
  const updateViewBox = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const { width, height, padding } = trackDimsRef.current;
    const zoom = zoomRef.current;
    const pan = panRef.current;
    const totalW = width + padding * 2;
    const totalH = height + padding * 2;
    const vbW = totalW / zoom;
    const vbH = totalH / zoom;
    const vbX = (totalW - vbW) / 2 - pan.x;
    const vbY = (totalH - vbH) / 2 - pan.y;
    svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  }, []);

  // Attach wheel + pointer events AFTER trackData loads (container exists)
  useEffect(() => {
    if (!trackData) return; // container div not rendered yet
    const container = containerRef.current;
    if (!container) return;

    // --- Wheel zoom (non-passive) ---
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomRef.current = Math.max(0.3, Math.min(zoomRef.current * factor, 10));
      setZoomDisplay(Math.round(zoomRef.current * 100));
      updateViewBox();
    };

    // --- Pointer pan ---
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      container.setPointerCapture(e.pointerId);
      container.style.cursor = 'grabbing';
    };

    const onMove = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      // Scale mouse pixels to SVG units: viewBox units per screen pixel
      const rect = container.getBoundingClientRect();
      const { width: tw, height: th, padding: tp } = trackDimsRef.current;
      const scaleX = (tw + tp * 2) / (rect.width * zoomRef.current);
      const scaleY = (th + tp * 2) / (rect.height * zoomRef.current);
      panRef.current = {
        x: panStartRef.current.panX + dx * scaleX,
        y: panStartRef.current.panY + dy * scaleY,
      };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateViewBox);
    };

    const onUp = () => {
      isPanningRef.current = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', onUp);
    container.addEventListener('pointercancel', onUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackData, updateViewBox]);

  const resetView = useCallback(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoomDisplay(100);
    updateViewBox();
  }, [updateViewBox]);

  const zoomIn = useCallback(() => {
    zoomRef.current = Math.min(zoomRef.current * 1.4, 10);
    setZoomDisplay(Math.round(zoomRef.current * 100));
    updateViewBox();
  }, [updateViewBox]);

  const zoomOut = useCallback(() => {
    zoomRef.current = Math.max(zoomRef.current * 0.6, 0.3);
    setZoomDisplay(Math.round(zoomRef.current * 100));
    updateViewBox();
  }, [updateViewBox]);

  if (loading) {
    return (
      <Panel title="Track Map" className="h-full">
        <div className="flex items-center justify-center h-full text-sm text-f1-text-muted">
          Loading track...
        </div>
      </Panel>
    );
  }

  if (error || !trackData) {
    return (
      <Panel title="Track Map" className="h-full">
        <div className="flex items-center justify-center h-full text-sm text-f1-text-muted">
          {error || 'No track data available'}
        </div>
      </Panel>
    );
  }

  const { points, bounds } = trackData;
  const padding = 50;
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  trackDimsRef.current = { width, height, padding };

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x - bounds.minX + padding},${p.y - bounds.minY + padding}`)
    .join(' ') + ' Z';

  const driverDots = (state?.drivers ?? [])
    .filter((d) => driverLocations[String(d.driverNumber)])
    .map((d) => {
      const loc = driverLocations[String(d.driverNumber)];
      return {
        ...d,
        svgX: (loc.x - bounds.minX) + padding,
        svgY: (loc.y - bounds.minY) + padding,
      };
    });

  const totalW = width + padding * 2;
  const totalH = height + padding * 2;
  const baseScale = Math.max(width, height) / 500;
  const dotR = Math.max(4, 6 * baseScale);
  const selectedDotR = dotR * 1.4;
  const fontSize = Math.max(8, 10 * baseScale);

  return (
    <Panel
      title="Track Map"
      className="h-full flex flex-col"
      headerRight={
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-mono text-f1-text-muted mr-1">{zoomDisplay}%</span>
          <button onClick={zoomIn} className="w-5 h-5 flex items-center justify-center text-[10px] text-f1-text-secondary hover:text-f1-text bg-f1-bg-tertiary rounded transition-colors" title="Zoom in">+</button>
          <button onClick={zoomOut} className="w-5 h-5 flex items-center justify-center text-[10px] text-f1-text-secondary hover:text-f1-text bg-f1-bg-tertiary rounded transition-colors" title="Zoom out">-</button>
          <button onClick={resetView} className="w-5 h-5 flex items-center justify-center text-[9px] text-f1-text-secondary hover:text-f1-text bg-f1-bg-tertiary rounded transition-colors" title="Reset view">R</button>
        </div>
      }
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Map area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-1 min-h-0 overflow-hidden touch-none"
          style={{ cursor: 'grab' }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${totalW} ${totalH}`}
            className="w-full h-full select-none"
            style={{ maxHeight: '100%' }}
          >
            <defs>
              <filter id="trackGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="driverGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Neon glow for track */}
              <filter id="neonGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur1" />
                <feGaussianBlur stdDeviation="2" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Track outer neon glow */}
            <path
              d={pathData}
              fill="none"
              stroke="#00d4ff"
              strokeWidth={16 * baseScale}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.08}
              filter="url(#neonGlow)"
            />

            {/* Track border */}
            <path
              d={pathData}
              fill="none"
              stroke="#3a3a5a"
              strokeWidth={12 * baseScale}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Track surface - brighter */}
            <path
              d={pathData}
              fill="none"
              stroke="#8888aa"
              strokeWidth={7 * baseScale}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#trackGlow)"
            />

            {/* Inner bright line */}
            <path
              d={pathData}
              fill="none"
              stroke="#aaaacc"
              strokeWidth={2 * baseScale}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5}
            />

            {/* Center dashes */}
            <path
              d={pathData}
              fill="none"
              stroke="#bbbbdd"
              strokeWidth={1.2 * baseScale}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${8 * baseScale} ${10 * baseScale}`}
              opacity={0.3}
            />

            {/* Non-selected driver dots */}
            {driverDots
              .filter((d) => d.driverNumber !== selectedDriver)
              .map((d) => {
                const isHovered = hoveredDriver === d.driverNumber;
                return (
                  <g
                    key={d.driverNumber}
                    onClick={(e) => { e.stopPropagation(); selectDriver(d.driverNumber); }}
                    onPointerEnter={() => setHoveredDriver(d.driverNumber)}
                    onPointerLeave={() => setHoveredDriver(null)}
                    className="cursor-pointer"
                  >
                    {/* Outer ring on hover */}
                    {isHovered && (
                      <circle
                        cx={d.svgX} cy={d.svgY}
                        r={dotR * 2}
                        fill="none"
                        stroke={`#${d.teamColour}`}
                        strokeWidth={0.8 * baseScale}
                        opacity={0.4}
                      />
                    )}
                    <circle
                      cx={d.svgX} cy={d.svgY}
                      r={isHovered ? dotR * 1.3 : dotR}
                      fill={`#${d.teamColour}`}
                      stroke={isHovered ? '#ffffff' : '#000000'}
                      strokeWidth={(isHovered ? 1.5 : 0.8) * baseScale}
                      opacity={isHovered ? 1 : 0.85}
                    />
                    <text
                      x={d.svgX}
                      y={d.svgY - dotR - 3 * baseScale}
                      textAnchor="middle"
                      fill={isHovered ? '#ffffff' : '#aaaacc'}
                      fontSize={(isHovered ? fontSize * 1.1 : fontSize * 0.8)}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      style={{ fontFamily: 'var(--font-f1)', pointerEvents: 'none' }}
                    >
                      {d.nameAcronym}
                    </text>
                    {isHovered && (
                      <text
                        x={d.svgX}
                        y={d.svgY + dotR + fontSize + 2 * baseScale}
                        textAnchor="middle"
                        fill={`#${d.teamColour}`}
                        fontSize={fontSize * 0.75}
                        fontWeight="bold"
                        style={{ fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}
                      >
                        P{d.position}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Selected driver (on top) */}
            {driverDots
              .filter((d) => d.driverNumber === selectedDriver)
              .map((d) => (
                <g
                  key={d.driverNumber}
                  onClick={(e) => { e.stopPropagation(); selectDriver(d.driverNumber); }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={d.svgX} cy={d.svgY}
                    r={selectedDotR * 3.5}
                    fill={`#${d.teamColour}`}
                    opacity={0.1}
                    filter="url(#driverGlow)"
                  />
                  <circle
                    cx={d.svgX} cy={d.svgY}
                    r={selectedDotR * 2.2}
                    fill="none"
                    stroke={`#${d.teamColour}`}
                    strokeWidth={1.5 * baseScale}
                    opacity={0.45}
                    className="animate-pulse-glow"
                  />
                  <circle
                    cx={d.svgX} cy={d.svgY}
                    r={selectedDotR}
                    fill={`#${d.teamColour}`}
                    stroke="#ffffff"
                    strokeWidth={2.5 * baseScale}
                  />
                  <rect
                    x={d.svgX - 22 * baseScale}
                    y={d.svgY - selectedDotR - fontSize * 2.2 - 2 * baseScale}
                    width={44 * baseScale}
                    height={fontSize * 1.5}
                    rx={3 * baseScale}
                    fill={`#${d.teamColour}`}
                    opacity={0.9}
                  />
                  <text
                    x={d.svgX}
                    y={d.svgY - selectedDotR - fontSize * 0.9 - 2 * baseScale}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={fontSize}
                    fontWeight="bold"
                    style={{ fontFamily: 'var(--font-f1)', pointerEvents: 'none' }}
                  >
                    {d.nameAcronym}
                  </text>
                  <text
                    x={d.svgX}
                    y={d.svgY + selectedDotR + fontSize + 5 * baseScale}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={fontSize * 0.8}
                    fontWeight="bold"
                    style={{ fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}
                  >
                    P{d.position} #{d.driverNumber}
                  </text>
                </g>
              ))}

            {/* No drivers message */}
            {driverDots.length === 0 && (
              <text
                x={totalW / 2}
                y={totalH / 2}
                textAnchor="middle"
                fill="#555566"
                fontSize={fontSize}
                style={{ fontFamily: 'var(--font-f1)' }}
              >
                Waiting for car positions...
              </text>
            )}

            {/* Car count */}
            {driverDots.length > 0 && (
              <text
                x={padding / 2}
                y={padding / 2}
                fill="#555566"
                fontSize={fontSize * 0.7}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {driverDots.length} cars on track
              </text>
            )}
          </svg>
        </div>

        {/* Disclaimer bar */}
        <div className="shrink-0 px-3 py-2 border-t border-f1-border/50 flex items-center gap-2 bg-f1-bg-secondary/30">
          <div className="w-1.5 h-1.5 rounded-full bg-f1-yellow/70 shrink-0" />
          <span className="text-[11px] text-white/50 leading-snug">
            Positions sampled from race data — not real-time.
            <span className="text-white/30 ml-2">Scroll to zoom · Drag to pan</span>
          </span>
        </div>
      </div>
    </Panel>
  );
}
