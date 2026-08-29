'use client';

import React, { useState } from 'react';
import { FastForward, Clock, Calendar } from 'lucide-react';
import { simulateTimeTravel } from '../services/api';

interface Props {
  onTimeTravel: () => void;
}

export const TimeTravelSlider: React.FC<Props> = ({ onTimeTravel }) => {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(3);

  const handleSimulate = async (daysForward: number) => {
    setLoading(true);
    try {
      await simulateTimeTravel(daysForward);
      onTimeTravel();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-amber-500/20 bg-amber-500/5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
          <FastForward className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-heading font-bold text-white flex items-center gap-2">
            <span>Autonomous Time-Travel Simulator</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
              Demo Feature
            </span>
          </h4>
          <p className="text-xs text-gray-400">
            Fast-forward time to simulate Google Cloud Scheduler crons and trigger live tone escalations.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={() => handleSimulate(1)}
          disabled={loading}
          className="flex-1 md:flex-none py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-gray-200 font-mono text-xs rounded-lg border border-slate-700 hover:border-amber-500/40 transition-colors"
        >
          +1 Day
        </button>
        <button
          onClick={() => handleSimulate(3)}
          disabled={loading}
          className="flex-1 md:flex-none py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-xs rounded-lg border border-amber-500/40 transition-colors font-semibold"
        >
          ⚡ +3 Days (Nudge)
        </button>
        <button
          onClick={() => handleSimulate(7)}
          disabled={loading}
          className="flex-1 md:flex-none py-1.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono text-xs rounded-lg border border-rose-500/40 transition-colors font-semibold"
        >
          🚨 +7 Days (Overdue)
        </button>
      </div>
    </div>
  );
};
