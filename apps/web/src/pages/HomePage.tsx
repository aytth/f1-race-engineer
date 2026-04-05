import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../stores/sessionStore';
import { fetchApi } from '../lib/api';
import type { OpenF1Meeting, OpenF1Session } from '@f1/shared';
import YearSelector from '../components/session/YearSelector';
import MeetingCard from '../components/session/MeetingCard';
import SessionPicker from '../components/session/SessionPicker';
import LoadingPulse from '../components/common/LoadingPulse';

export default function HomePage() {
  const navigate = useNavigate();
  const sessionRef = useRef<HTMLDivElement>(null);
  const {
    selectedYear,
    meetings,
    selectedMeeting,
    sessions,
    selectedSession,
    loading,
    error,
    setYear,
    setMeetings,
    selectMeeting,
    setSessions,
    selectSession,
    setLoading,
    setError,
  } = useSessionStore();

  // Fetch meetings when year changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchApi<OpenF1Meeting[]>('/meetings', { year: String(selectedYear) })
      .then(setMeetings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  // Fetch sessions when meeting selected
  useEffect(() => {
    if (!selectedMeeting) return;
    setLoading(true);
    fetchApi<OpenF1Session[]>('/sessions', { meeting_key: String(selectedMeeting.meeting_key) })
      .then((s) => {
        setSessions(s);
        // Scroll to session picker
        setTimeout(() => sessionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedMeeting]);

  function handleSessionSelect(session: OpenF1Session) {
    selectSession(session);
    navigate(`/dashboard/${session.session_key}`);
  }

  function handleBackToCalendar() {
    selectMeeting(null);
    setSessions([]);
  }

  return (
    <div className="min-h-screen bg-f1-bg">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-f1-border">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Red accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-f1-red via-f1-red to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex items-start gap-4">
            <div className="w-2 h-16 bg-f1-red rounded-sm mt-1 shrink-0" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold tracking-[0.3em] text-f1-red uppercase">AI-Powered</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase leading-none mb-3">
                Race<br />Engineer
              </h1>
              <p className="text-f1-text-secondary text-base md:text-lg max-w-md">
                Real-time pit wall strategy powered by telemetry data and Claude AI. Select a Grand Prix to begin.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Year selector */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-f1-cyan rounded-full" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-f1-text">
              Season
            </h2>
          </div>
          <YearSelector selected={selectedYear} onChange={setYear} />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-4 border-l-2 border-l-f1-red mb-6"
            >
              <p className="text-sm text-f1-red">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && meetings.length === 0 && <LoadingPulse text="Loading race calendar..." />}

        {/* Selected meeting detail + session picker */}
        <AnimatePresence mode="wait">
          {selectedMeeting && sessions.length > 0 && (
            <motion.div
              key="session-picker"
              ref={sessionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-10"
            >
              <div className="glass-panel overflow-hidden">
                {/* Meeting header bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-f1-border bg-f1-bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleBackToCalendar}
                      className="flex items-center gap-1.5 text-xs text-f1-text-secondary hover:text-f1-text transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-180">
                        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Back
                    </button>
                    <div className="w-px h-6 bg-f1-border" />
                    <div>
                      <div className="text-xs text-f1-text-muted uppercase tracking-wider">
                        {selectedMeeting.country_name} &middot; {selectedMeeting.circuit_short_name}
                      </div>
                      <h3 className="text-lg font-bold">{selectedMeeting.meeting_name}</h3>
                    </div>
                  </div>
                  <div className="text-xs text-f1-text-muted font-mono">
                    {new Date(selectedMeeting.date_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Sessions */}
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-f1-text-muted mb-3">
                    Select Session
                  </div>
                  <SessionPicker
                    sessions={sessions}
                    selected={selectedSession}
                    onSelect={handleSessionSelect}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading sessions */}
        {selectedMeeting && loading && sessions.length === 0 && (
          <div className="mb-10">
            <LoadingPulse text={`Loading ${selectedMeeting.meeting_name} sessions...`} />
          </div>
        )}

        {/* Grand Prix grid */}
        {meetings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-f1-red rounded-full" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-f1-text">
                  {selectedYear} Calendar
                </h2>
              </div>
              <span className="text-xs text-f1-text-muted font-mono">
                {meetings.length} Grands Prix
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {meetings.map((meeting, i) => (
                <MeetingCard
                  key={meeting.meeting_key}
                  meeting={meeting}
                  index={i}
                  selected={selectedMeeting?.meeting_key === meeting.meeting_key}
                  onClick={() => selectMeeting(meeting)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-f1-border mt-16 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="text-[10px] text-f1-text-muted">
            Data provided by OpenF1 API &middot; AI by Anthropic Claude
          </div>
          <div className="text-[10px] text-f1-text-muted">
            Not affiliated with Formula 1
          </div>
        </div>
      </footer>
    </div>
  );
}
