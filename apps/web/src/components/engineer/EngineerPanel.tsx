import { useRef, useEffect, useState } from 'react';
import { useEngineerStore } from '../../stores/engineerStore';
import { useTelemetryStore } from '../../stores/telemetryStore';
import Panel from '../common/Panel';
import StatusLED from '../common/StatusLED';
import RadioMessage from './RadioMessage';

export default function EngineerPanel() {
  const { messages, apiKey, setApiKey, connected, status } = useEngineerStore();
  const { selectedDriver } = useTelemetryStore();
  const feedRef = useRef<HTMLDivElement>(null);
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  const [keyInput, setKeyInput] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMessageCount = useRef(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }

    // Play radio crackle on new messages
    if (messages.length > lastMessageCount.current && messages.length > 0) {
      playRadioCrackle();
    }
    lastMessageCount.current = messages.length;
  }, [messages]);

  function playRadioCrackle() {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/audio/radio-static.mp3');
        audioRef.current.volume = 0.3;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }

  function handleKeySubmit() {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
      setShowKeyInput(false);
    }
  }

  const driverMessages = selectedDriver
    ? messages.filter((m) => m.driverNumber === selectedDriver)
    : messages;

  return (
    <Panel
      title="AI Race Engineer"
      className="h-full flex flex-col"
      headerRight={
        <div className="flex items-center gap-2">
          <StatusLED active={connected} />
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-[9px] text-f1-text-muted hover:text-f1-text"
          >
            {apiKey ? 'Key Set' : 'Set Key'}
          </button>
        </div>
      }
    >
      {/* API Key Input */}
      {showKeyInput && (
        <div className="p-3 border-b border-f1-border bg-f1-bg-tertiary/50">
          <label className="text-[10px] text-f1-text-secondary uppercase tracking-wider">
            Anthropic API Key
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 bg-f1-bg text-sm text-f1-text px-2 py-1 rounded border border-f1-border focus:border-f1-cyan focus:outline-none font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleKeySubmit()}
            />
            <button
              onClick={handleKeySubmit}
              className="px-3 py-1 bg-f1-red text-white text-xs font-semibold rounded hover:bg-red-700"
            >
              Save
            </button>
          </div>
          <p className="text-[9px] text-f1-text-muted mt-1">
            Your key is stored locally and sent directly to Anthropic. Never stored on our servers.
          </p>
        </div>
      )}

      {/* Status bar */}
      <div className="px-3 py-1.5 text-[10px] text-f1-text-muted border-b border-f1-border/50">
        {status}
      </div>

      {/* Radio feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {!apiKey && (
          <div className="text-center py-8 text-sm text-f1-text-muted">
            Enter your Anthropic API key to activate the AI race engineer
          </div>
        )}

        {apiKey && driverMessages.length === 0 && (
          <div className="text-center py-8 text-sm text-f1-text-muted">
            {selectedDriver
              ? 'Waiting for engineer analysis...'
              : 'Select a driver to receive radio messages'}
          </div>
        )}

        {driverMessages.map((msg, i) => (
          <RadioMessage
            key={msg.id}
            message={msg}
            isNew={i === driverMessages.length - 1}
          />
        ))}
      </div>
    </Panel>
  );
}
