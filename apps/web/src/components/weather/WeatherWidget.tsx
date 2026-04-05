import type { OpenF1Weather } from '@f1/shared';

interface WeatherWidgetProps {
  weather: OpenF1Weather | null;
}

export default function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 text-[10px] text-f1-text-secondary">
      <span>Air {weather.air_temperature}°C</span>
      <span>Track {weather.track_temperature}°C</span>
      <span>Humidity {weather.humidity}%</span>
      <span>Wind {weather.wind_speed} km/h</span>
      {weather.rainfall > 0 && (
        <span className="text-f1-cyan font-bold animate-pulse-glow">RAIN</span>
      )}
    </div>
  );
}
