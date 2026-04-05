import { useEffect, useState, useRef } from 'react';
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
  const { state, selectedDriver, selectDriver } = useTelemetryStore();
  const locIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

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
  const padding = 40;
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  // Build SVG path
  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x - bounds.minX + padding},${p.y - bounds.minY + padding}`)
    .join(' ') + ' Z';

  // Map driver locations to SVG coords
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

  return (
    <Panel title="Track Map" className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
        <svg
          viewBox={`0 0 ${width + padding * 2} ${height + padding * 2}`}
          className="w-full h-full"
          style={{ maxHeight: '100%' }}
        >
          {/* Track outline */}
          <path
            d={pathData}
            fill="none"
            stroke="#2a2a3a"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathData}
            fill="none"
            stroke="#3a3a4a"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Driver dots */}
          {driverDots.map((d) => {
            const isSelected = d.driverNumber === selectedDriver;
            return (
              <g key={d.driverNumber} onClick={() => selectDriver(d.driverNumber)} className="cursor-pointer">
                {isSelected && (
                  <circle cx={d.svgX} cy={d.svgY} r={12} fill={`#${d.teamColour}33`} className="animate-pulse-glow" />
                )}
                <circle
                  cx={d.svgX} cy={d.svgY}
                  r={isSelected ? 6 : 4}
                  fill={`#${d.teamColour}`}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth={1.5}
                />
                {isSelected && (
                  <text x={d.svgX} y={d.svgY - 12} textAnchor="middle"
                    className="text-[10px] font-bold fill-f1-text"
                    style={{ fontFamily: 'var(--font-f1)' }}
                  >
                    {d.nameAcronym}
                  </text>
                )}
              </g>
            );
          })}

          {driverDots.length === 0 && (
            <text x={width / 2 + padding} y={height / 2 + padding} textAnchor="middle"
              className="text-[11px] fill-f1-text-muted" style={{ fontFamily: 'var(--font-f1)' }}
            >
              Waiting for car positions...
            </text>
          )}
        </svg>
      </div>
    </Panel>
  );
}
