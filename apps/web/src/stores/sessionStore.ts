import { create } from 'zustand';
import type { OpenF1Meeting, OpenF1Session } from '@f1/shared';

interface SessionStore {
  selectedYear: number;
  meetings: OpenF1Meeting[];
  selectedMeeting: OpenF1Meeting | null;
  sessions: OpenF1Session[];
  selectedSession: OpenF1Session | null;
  loading: boolean;
  error: string | null;

  setYear: (year: number) => void;
  setMeetings: (meetings: OpenF1Meeting[]) => void;
  selectMeeting: (meeting: OpenF1Meeting | null) => void;
  setSessions: (sessions: OpenF1Session[]) => void;
  selectSession: (session: OpenF1Session) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  selectedYear: 2024,
  meetings: [],
  selectedMeeting: null,
  sessions: [],
  selectedSession: null,
  loading: false,
  error: null,

  setYear: (year) => set({ selectedYear: year, meetings: [], selectedMeeting: null, sessions: [], selectedSession: null }),
  setMeetings: (meetings) => set({ meetings }),
  selectMeeting: (meeting) => set({ selectedMeeting: meeting, sessions: [], selectedSession: null }),
  setSessions: (sessions) => set({ sessions }),
  selectSession: (session) => set({ selectedSession: session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
