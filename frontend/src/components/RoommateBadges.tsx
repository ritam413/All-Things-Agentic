'use client';

import React from 'react';
import { Users, Zap, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Roommate } from '../../../shared/types';

interface Props {
  roommates: Roommate[];
}

export const RoommateBadges: React.FC<Props> = ({ roommates }) => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-blue" />
          <span>Household & Habit Memory</span>
        </h3>
        <span className="text-xs font-mono text-gray-500">{roommates.length} Flatmates</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roommates.map((rm) => {
          const isRapid = rm.habit_badge === 'RAPID_SETTLER';
          const isLate = rm.habit_badge === 'CHRONIC_LATE';

          return (
            <div
              key={rm.id}
              className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{rm.name}</span>
                <span className="text-[10px] font-mono text-gray-400">{rm.room_sq_ft} sqft</span>
              </div>

              <div className="text-[11px] font-mono text-gray-400 truncate">
                VPA: <span className="text-cyan-300">{rm.upi_vpa}</span>
              </div>

              {/* Habit Badge Indicator */}
              <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-mono">
                  ~{rm.avg_settlement_hours.toFixed(0)}h latency
                </span>
                {isRapid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold">
                    <Zap className="w-3 h-3" />
                    <span>Rapid</span>
                  </span>
                ) : isLate ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Chronic Late</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Reliable</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
