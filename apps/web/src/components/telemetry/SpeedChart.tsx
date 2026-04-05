import { useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

interface SpeedChartProps {
  driverNumber: number;
  speed: number;
}

// Store speed history per driver (survives re-renders)
const speedHistory = new Map<number, { time: number; speed: number }[]>();

export default function SpeedChart({ driverNumber, speed }: SpeedChartProps) {
  // Track speed history
  useEffect(() => {
    if (!speedHistory.has(driverNumber)) {
      speedHistory.set(driverNumber, []);
    }
    const history = speedHistory.get(driverNumber)!;

    // Only add if speed changed or enough time passed
    const lastEntry = history[history.length - 1];
    if (!lastEntry || speed !== lastEntry.speed || Date.now() - lastEntry.time > 5000) {
      history.push({ time: Date.now(), speed });
    }

    // Keep last 60 data points
    if (history.length > 60) {
      history.splice(0, history.length - 60);
    }
  }, [driverNumber, speed]);

  const data = speedHistory.get(driverNumber) || [];

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-f1-text-muted">
        Collecting speed data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis
          domain={[0, 360]}
          tick={{ fill: '#555566', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <Area
          type="monotone"
          dataKey="speed"
          stroke="#00d4ff"
          strokeWidth={2}
          fill="url(#speedGradient)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
