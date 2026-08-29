'use client';

import React, { useState } from 'react';
import { FastForward, Clock, Calendar } from 'lucide-react';
import { simulateTimeTravel } from '../services/api';

interface Props {
  householdId?: string;
  onTimeTravel: () => void;
}

export const TimeTravelSlider: React.FC<Props> = ({ householdId, onTimeTravel }) => {
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (daysForward: number) => {
    setLoading(true);
    try {
      await simulateTimeTravel(daysForward, householdId);
      onTimeTravel();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfaf5] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#1a3300] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#ffe95c] border border-[#1a3300] rounded-[6px] text-[#1a3300]">
          <FastForward className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#1a3300] flex items-center gap-2">
            <span>Autonomous Time-Travel Simulator</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#d5f5c2] text-[#1a3300] border border-[#1a3300] rounded-full">
              Demo Feature
            </span>
          </h4>
          <p className="text-xs text-[#1a3300]/70 font-sans">
            Fast-forward time to simulate Google Cloud Scheduler crons and trigger live tone escalations.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={() => handleSimulate(1)}
          disabled={loading}
          className="flex-1 md:flex-none py-1.5 px-3 bg-[#fcfaf5] hover:bg-[#e8e4d9] text-[#1a3300] font-mono text-xs rounded-[6px] border border-[#b6b6b6] hover:border-[#1a3300] transition-transform active:scale-[0.97]"
        >
          +1 Day
        </button>
        <button
          onClick={() => handleSimulate(3)}
          disabled={loading}
          className="flex-1 md:flex-none py-1.5 px-3 bg-[#ffe95c] hover:bg-[#fedb34] text-[#1a3300] font-mono text-xs rounded-[6px] border border-[#1a3300] font-semibold transition-transform active:scale-[0.97]"
        >
          ⚡ +3 Days (Nudge)
        </button>
        <button
          onClick={() => handleSimulate(7)}
          disabled={loading}
          className="flex-1 md:flex-none py-1.5 px-3 bg-[#cb5521] hover:bg-[#b54919] text-[#fcfaf5] font-mono text-xs rounded-[6px] border border-[#1a3300] font-semibold transition-transform active:scale-[0.97]"
        >
          🚨 +7 Days (Overdue)
        </button>
      </div>
    </div>
  );
};
