'use client';

import React from 'react';
import { Users, Zap, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Roommate } from '../../../shared/types';

interface Props {
  roommates: Roommate[];
}

export const RoommateBadges: React.FC<Props> = ({ roommates }) => {
  const stickyFills = ['bg-[#d5f5c2]', 'bg-[#a8e5e5]', 'bg-[#f6d0ff]', 'bg-[#ffe95c]'];

  return (
    <div className="bg-[#fcfaf5] p-6 space-y-4 rounded-[12px] border border-[#1a3300] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a3300] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#1a3300]" />
          <span>Household & Habit Memory</span>
        </h3>
        <span className="text-xs font-mono px-2 py-0.5 bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] rounded-full">
          {roommates.length} Flatmates
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roommates.map((rm, idx) => {
          const isRapid = rm.habit_badge === 'RAPID_SETTLER';
          const isLate = rm.habit_badge === 'CHRONIC_LATE';
          const fillClass = stickyFills[idx % stickyFills.length];

          return (
            <div
              key={rm.id}
              className={`p-3.5 ${fillClass} rounded-[8px] border border-[#1a3300] space-y-2 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1a3300]">{rm.name}</span>
                <span className="text-[10px] font-mono text-[#1a3300]/70">{rm.room_sq_ft} sqft</span>
              </div>

              <div className="text-[11px] font-mono text-[#1a3300]/80 truncate">
                VPA: <span className="font-semibold">{rm.upi_vpa}</span>
              </div>

              {/* Habit Badge Indicator */}
              <div className="pt-1.5 border-t border-[#1a3300]/20 flex items-center justify-between">
                <span className="text-[10px] text-[#1a3300]/70 font-mono">
                  ~{rm.avg_settlement_hours.toFixed(0)}h latency
                </span>
                {isRapid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] rounded-full font-bold">
                    <Zap className="w-3 h-3 text-[#1a3300]" />
                    <span>Rapid</span>
                  </span>
                ) : isLate ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-[#cb5521] text-[#fcfaf5] border border-[#1a3300] rounded-full font-bold">
                    <AlertTriangle className="w-3 h-3 text-[#fcfaf5]" />
                    <span>Chronic Late</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3 text-[#1a3300]" />
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
