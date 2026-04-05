import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelemetry } from '../hooks/useTelemetry';
import { useReplay } from '../hooks/useReplay';
import { useEngineer } from '../hooks/useEngineer';
import { useTelemetryStore } from '../stores/telemetryStore';
import { useReplayStore } from '../stores/replayStore';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Header from '../components/layout/Header';
import DashboardGrid from '../components/layout/DashboardGrid';
import TimingTower from '../components/timing/TimingTower';
import TrackMap from '../components/track/TrackMap';
import TelemetryPanel from '../components/telemetry/TelemetryPanel';
import EngineerPanel from '../components/engineer/EngineerPanel';
import StrategyPanel from '../components/strategy/StrategyPanel';
import PlaybackControls from '../components/replay/PlaybackControls';

export default function DashboardPage() {
  const { sessionKey } = useParams<{ sessionKey: string }>();
  const navigate = useNavigate();
  const { selectedDriver } = useTelemetryStore();
  const { isReplayMode, setReplayMode } = useReplayStore();

  const sessionKeyNum = sessionKey ? Number(sessionKey) : null;

  // Connect to telemetry and engineer polling
  useTelemetry(sessionKeyNum);
  useReplay(sessionKeyNum);
  useEngineer(sessionKeyNum, selectedDriver);

  // Auto-enable replay mode (historical sessions)
  useEffect(() => {
    if (sessionKeyNum) {
      setReplayMode(true);
    }
    return () => {
      useReplayStore.getState().reset();
    };
  }, [sessionKeyNum]);

  if (!sessionKeyNum) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-f1-bg overflow-hidden">
      <Header />
      <ErrorBoundary>
        <DashboardGrid
          timingTower={
            <ErrorBoundary fallback={<PanelError label="Timing" />}>
              <TimingTower />
            </ErrorBoundary>
          }
          trackMap={
            <ErrorBoundary fallback={<PanelError label="Track Map" />}>
              <TrackMap sessionKey={sessionKeyNum} />
            </ErrorBoundary>
          }
          telemetry={
            <ErrorBoundary fallback={<PanelError label="Telemetry" />}>
              <TelemetryPanel />
            </ErrorBoundary>
          }
          engineer={
            <ErrorBoundary fallback={<PanelError label="Engineer" />}>
              <EngineerPanel />
            </ErrorBoundary>
          }
          strategy={
            <ErrorBoundary fallback={<PanelError label="Strategy" />}>
              <StrategyPanel />
            </ErrorBoundary>
          }
        />
      </ErrorBoundary>
      {/* Replay playback controls */}
      {isReplayMode && <PlaybackControls />}
    </div>
  );
}

function PanelError({ label }: { label: string }) {
  return (
    <div className="glass-panel h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-xs text-f1-red font-semibold mb-1">{label} Error</div>
        <div className="text-[10px] text-f1-text-muted">Failed to load panel</div>
      </div>
    </div>
  );
}
