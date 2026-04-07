import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { fetchApi } from '../../lib/api';
import type { OpenF1Driver } from '@f1/shared';

const DRIVER_META: Record<number, { nationality: string; dob: string }> = {
  1: { nationality: 'Dutch', dob: '1997-09-30' },
  2: { nationality: 'Japanese', dob: '2000-01-13' },
  3: { nationality: 'Australian', dob: '1989-07-01' },
  4: { nationality: 'British', dob: '1999-02-15' },
  10: { nationality: 'French', dob: '1996-01-07' },
  11: { nationality: 'Mexican', dob: '1990-01-26' },
  14: { nationality: 'Spanish', dob: '1981-07-29' },
  16: { nationality: 'Monegasque', dob: '1997-10-16' },
  18: { nationality: 'Canadian', dob: '1999-11-01' },
  20: { nationality: 'Danish', dob: '1999-12-12' },
  22: { nationality: 'Japanese', dob: '1994-01-29' },
  23: { nationality: 'Thai', dob: '1994-03-23' },
  24: { nationality: 'Chinese', dob: '1999-02-16' },
  27: { nationality: 'German', dob: '1999-12-22' },
  31: { nationality: 'French', dob: '1996-09-17' },
  44: { nationality: 'British', dob: '1985-01-07' },
  55: { nationality: 'Spanish', dob: '1994-09-01' },
  63: { nationality: 'British', dob: '1998-02-15' },
  77: { nationality: 'Finnish', dob: '1989-08-28' },
  81: { nationality: 'Australian', dob: '2001-04-06' },
};

function getAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

interface DriverProfileProps {
  sessionKey: number;
}

export default function DriverProfile({ sessionKey }: DriverProfileProps) {
  const { state, selectedDriver } = useTelemetryStore();
  const [driverDetails, setDriverDetails] = useState<Record<number, OpenF1Driver>>({});
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetchApi<OpenF1Driver[]>('/drivers', { session_key: String(sessionKey) })
      .then((drivers) => {
        const map: Record<number, OpenF1Driver> = {};
        for (const d of drivers) map[d.driver_number] = d;
        setDriverDetails(map);
      })
      .catch(() => {});
  }, [sessionKey]);

  useEffect(() => setImgError(false), [selectedDriver]);

  const driverSnap = state?.drivers.find((d) => d.driverNumber === selectedDriver);
  const driverInfo = selectedDriver ? driverDetails[selectedDriver] : null;
  const meta = selectedDriver ? DRIVER_META[selectedDriver] : null;

  return (
    <AnimatePresence mode="wait">
      {driverSnap && selectedDriver ? (
        <motion.div
          key={selectedDriver}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="border-t border-f1-border bg-f1-bg-secondary/40"
        >
          {/* Team color accent bar */}
          <div className="h-[3px]" style={{ backgroundColor: `#${driverSnap.teamColour}` }} />

          <div className="p-3">
            {/* Top row: large headshot + name/info */}
            <div className="flex gap-3">
              {/* Large headshot */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 18 }}
                className="relative shrink-0"
              >
                <div
                  className="w-[90px] h-[105px] rounded-lg overflow-hidden border-2 shadow-lg"
                  style={{
                    borderColor: `#${driverSnap.teamColour}`,
                    boxShadow: `0 4px 20px #${driverSnap.teamColour}30`,
                  }}
                >
                  {driverInfo?.headshot_url && !imgError ? (
                    <img
                      src={driverInfo.headshot_url}
                      alt={driverInfo.full_name}
                      className="w-full h-full object-cover object-top"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                      style={{ backgroundColor: `#${driverSnap.teamColour}30` }}
                    >
                      {driverSnap.nameAcronym}
                    </div>
                  )}
                </div>
                {/* Number badge */}
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 border-f1-bg-secondary shadow-md"
                  style={{ backgroundColor: `#${driverSnap.teamColour}`, color: '#000' }}
                >
                  {driverSnap.driverNumber}
                </div>
              </motion.div>

              {/* Name, team, position */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                className="flex-1 min-w-0 flex flex-col justify-between py-0.5"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/60 mb-1">
                    {driverInfo?.team_name || driverSnap.teamName}
                  </div>
                  <div className="leading-tight">
                    {driverInfo ? (
                      <>
                        <div className="text-xs text-white/70 font-medium uppercase">{driverInfo.first_name}</div>
                        <div className="text-lg font-black uppercase text-white tracking-wide">{driverInfo.last_name}</div>
                      </>
                    ) : (
                      <div className="text-lg font-black uppercase text-white">{driverSnap.nameAcronym}</div>
                    )}
                  </div>
                </div>
                {/* Position + tire */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-base font-mono font-black px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `#${driverSnap.teamColour}30`,
                      color: `#${driverSnap.teamColour}`,
                    }}
                  >
                    P{driverSnap.position}
                  </span>
                  {driverSnap.currentStint && (
                    <span className="text-[10px] font-mono text-white/50">
                      {driverSnap.currentStint.compound} · {driverSnap.currentStint.tyreAge}L
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="grid grid-cols-3 gap-1.5 mt-3"
            >
              {meta && (
                <>
                  <StatItem label="Age" value={`${getAge(meta.dob)}`} />
                  <StatItem label="Nationality" value={meta.nationality} />
                </>
              )}
              <StatItem label="Lap" value={String(driverSnap.lapNumber)} />
              <StatItem
                label="Speed"
                value={`${driverSnap.currentSpeed}`}
                unit="km/h"
                highlight
              />
              <StatItem
                label="Last Lap"
                value={driverSnap.lastLapTime ? driverSnap.lastLapTime.toFixed(3) : '--'}
                unit={driverSnap.lastLapTime ? 's' : ''}
              />
              <StatItem
                label="Gap"
                value={
                  driverSnap.position === 1
                    ? 'LEADER'
                    : driverSnap.interval != null
                      ? `+${typeof driverSnap.interval === 'number' ? driverSnap.interval.toFixed(3) : driverSnap.interval}`
                      : '--'
                }
                unit={driverSnap.position !== 1 && driverSnap.interval != null ? 's' : ''}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 border-t border-f1-border text-center"
        >
          <div className="text-xs text-white/40 uppercase tracking-wider py-2">
            Select a driver for details
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatItem({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className="bg-f1-bg-tertiary/60 rounded px-2 py-2">
      <div className="text-[9px] uppercase tracking-wider text-white/40 leading-tight">{label}</div>
      <div className={`text-sm font-mono font-bold text-white truncate ${highlight ? 'text-f1-green!' : ''}`}>
        {value}
        {unit && <span className="text-white/40 font-normal text-[10px] ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}
