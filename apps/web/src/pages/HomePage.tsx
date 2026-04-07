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

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchApi<OpenF1Meeting[]>('/meetings', { year: String(selectedYear) })
      .then(setMeetings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedMeeting) return;
    setLoading(true);
    fetchApi<OpenF1Session[]>('/sessions', { meeting_key: String(selectedMeeting.meeting_key) })
      .then((s) => {
        setSessions(s);
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
    <div className="min-h-screen bg-f1-bg relative">
      {/* ===== LEFT SIDE RACING ANIMATIONS ===== */}
      <div className="fixed left-0 top-0 bottom-0 w-6 md:w-10 pointer-events-none z-10 overflow-hidden">
        <div className="absolute left-1 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-f1-red/20 to-transparent" />
        <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-f1-red/10 to-transparent" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`l-${i}`}
            className="absolute left-1 w-[2px] h-20 car-streak-down"
            style={{
              animationDelay: `${i * 2.5}s`,
              background: 'linear-gradient(to bottom, transparent, #e10600, #e1060080, transparent)',
            }}
          />
        ))}
        <div className="absolute left-5 md:left-6 top-1/4 flex flex-col gap-2 opacity-[0.06]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-1.5">
              <div className={`w-1.5 h-1.5 ${i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`} />
              <div className={`w-1.5 h-1.5 ${i % 2 === 1 ? 'bg-white' : 'bg-transparent'}`} />
            </div>
          ))}
        </div>
        <svg className="absolute bottom-20 left-0 w-8 h-8 opacity-[0.08]" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#e10600" strokeWidth="2" strokeDasharray="8 4" className="tach-spin" />
          <circle cx="30" cy="30" r="18" fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="6 6" className="tach-spin-reverse" />
        </svg>
      </div>

      {/* ===== RIGHT SIDE RACING ANIMATIONS ===== */}
      <div className="fixed right-0 top-0 bottom-0 w-6 md:w-10 pointer-events-none z-10 overflow-hidden">
        <div className="absolute right-1 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-f1-cyan/20 to-transparent" />
        <div className="absolute right-3 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-f1-cyan/10 to-transparent" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`r-${i}`}
            className="absolute right-1 w-[2px] h-20 car-streak-up"
            style={{
              animationDelay: `${i * 2.5 + 1}s`,
              background: 'linear-gradient(to top, transparent, #00d4ff, #00d4ff80, transparent)',
            }}
          />
        ))}
        <div className="absolute right-5 md:right-6 top-1/3 flex flex-col gap-1.5 opacity-[0.12]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full rpm-dot"
              style={{
                backgroundColor: i < 3 ? '#00ff88' : i < 6 ? '#ffd700' : '#e10600',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <svg className="absolute bottom-32 right-0 w-8 h-8 opacity-[0.08]" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#00d4ff" strokeWidth="2" strokeDasharray="8 4" className="tach-spin-reverse" />
          <circle cx="30" cy="30" r="18" fill="none" stroke="#e10600" strokeWidth="1.5" strokeDasharray="6 6" className="tach-spin" />
        </svg>
      </div>

      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden border-b border-f1-border">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute h-[1px] speed-line"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                width: '30%',
                background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? '#e1060030' : '#00d4ff20'}, transparent)`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
          {[0, 1, 2].map((i) => (
            <div
              key={`r-${i}`}
              className="absolute h-[1px] speed-line-reverse"
              style={{
                top: `${30 + i * 20}%`,
                right: 0,
                width: '25%',
                background: `linear-gradient(270deg, transparent, ${i % 2 === 0 ? '#00d4ff20' : '#e1060020'}, transparent)`,
                animationDelay: `${i * 0.7 + 0.3}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute top-0 left-0 right-0 h-[3px]">
          <div className="h-full bg-gradient-to-r from-transparent via-f1-red to-transparent" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full w-[20%] bg-gradient-to-r from-transparent via-white/40 to-transparent racing-stripe-sweep" />
          </div>
        </div>

        {/* HERO CONTENT — ALL CENTERED */}
        <div className="relative w-full px-6 py-20 md:py-28 flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-f1-red starting-light"
                style={{
                  animationDelay: `${0.3 + i * 0.4}s`,
                  boxShadow: '0 0 8px rgba(225, 6, 0, 0.6)',
                }}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-f1-red/30 bg-f1-red/10 mb-5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-f1-red animate-pulse-glow" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-f1-red uppercase">AI-Powered</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-none mb-2">
              <span className="text-f1-text">Race</span>
            </h1>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-none mb-6">
              <span className="text-f1-red">Engineer</span>
            </h1>
          </motion.div>
          <div className="w-64 md:w-80 h-1.5 bg-f1-bg-tertiary rounded-full overflow-hidden mb-6">
            <div className="h-full rounded-full animate-rpm" style={{ background: 'linear-gradient(90deg, #00ff88, #ffd700, #e10600)' }} />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-f1-text-secondary text-sm md:text-base text-center leading-relaxed"
          >
            Real-time pit wall strategy powered by real telemetry data.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-f1-text-muted text-xs text-center mt-1"
          >
            Select a Grand Prix below to begin.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-6"
          >
            <span className="text-[9px] text-f1-text-muted uppercase tracking-wider">Real F1 data from OpenF1 API</span>
            <div className="w-1 h-1 rounded-full bg-f1-text-muted" />
            <span className="text-[9px] text-f1-text-muted uppercase tracking-wider">2023 - 2025 Seasons</span>
          </motion.div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="mx-auto px-10 md:px-16 lg:px-20 py-8" style={{ maxWidth: '1200px' }}>
        {/* Year selector — CENTERED */}
        <div className="mb-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-f1-cyan rounded-full" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-f1-text">Season</h2>
          </div>
          <YearSelector selected={selectedYear} onChange={setYear} />
        </div>

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

        {loading && meetings.length === 0 && <LoadingPulse text="Loading race calendar..." />}

        {/* Selected meeting + session picker — CENTERED */}
        <AnimatePresence mode="wait">
          {selectedMeeting && sessions.length > 0 && (
            <motion.div
              key="session-picker"
              ref={sessionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-10 flex justify-center"
            >
              <div className="glass-panel overflow-hidden w-full max-w-3xl">
                <div className="px-5 py-4 border-b border-f1-border bg-f1-bg-secondary/50 text-center">
                  <button
                    onClick={handleBackToCalendar}
                    className="inline-flex items-center gap-1.5 text-xs text-f1-text-secondary hover:text-f1-text transition-colors mb-3"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to Calendar
                  </button>
                  <div className="text-xs text-f1-text-muted uppercase tracking-wider mb-1">
                    {selectedMeeting.country_name} &middot; {selectedMeeting.circuit_short_name}
                  </div>
                  <h3 className="text-xl font-bold">{selectedMeeting.meeting_name}</h3>
                  <div className="text-xs text-f1-text-muted font-mono mt-1">
                    {new Date(selectedMeeting.date_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-f1-text-muted mb-4 text-center">Select Session</div>
                  <SessionPicker sessions={sessions} selected={selectedSession} onSelect={handleSessionSelect} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedMeeting && loading && sessions.length === 0 && (
          <div className="mb-10">
            <LoadingPulse text={`Loading ${selectedMeeting.meeting_name} sessions...`} />
          </div>
        )}

        {/* Grand Prix grid — CENTERED heading */}
        {meetings.length > 0 && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-1 h-5 bg-f1-red rounded-full" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-f1-text">
                {selectedYear} Calendar
              </h2>
              <span className="text-xs text-f1-text-muted font-mono">({meetings.length} Grands Prix)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

      <footer className="border-t border-f1-border mt-16 py-6">
        <div className="mx-auto px-10 md:px-16 lg:px-20 flex items-center justify-between" style={{ maxWidth: '1200px' }}>
          <div className="text-[10px] text-f1-text-muted">Data provided by OpenF1 API &middot; AI by Anthropic Claude</div>
          <div className="text-[10px] text-f1-text-muted">Not affiliated with Formula 1</div>
        </div>
      </footer>
    </div>
  );
}
