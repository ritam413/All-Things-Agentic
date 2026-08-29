'use client';

import React from 'react';
import { Activity, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AgentActivityLog } from '../../../shared/types';

interface Props {
  logs: AgentActivityLog[];
  onRefresh: () => void;
}

export const AgentActivityStream: React.FC<Props> = ({ logs, onRefresh }) => {
  return (
    <div className="bg-[#fcfaf5] p-6 space-y-4 rounded-[12px] border border-[#1a3300] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a3300] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#1a3300]" />
          <span>Agent Activity & Audit Stream</span>
        </h3>
        <button
          onClick={onRefresh}
          className="text-xs font-mono font-medium text-[#1a3300] hover:underline px-2 py-1 bg-[#ffe95c] rounded-[4px] border border-[#1a3300] transition-transform active:scale-[0.97]"
        >
          Refresh Feed
        </button>
      </div>

      <p className="text-xs text-[#1a3300]/70 font-sans leading-relaxed">
        Chronological audit trail of autonomous due-date scans, split calculations, and tone escalations.
      </p>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="p-4 bg-[#fcfaf5] rounded-[8px] border border-dashed border-[#b6b6b6] text-center text-xs text-[#1a3300]/60 font-mono">
            No agent activity logged yet.
          </div>
        ) : (
          logs.map((log) => {
            const isAlert = log.severity === 'ALERT';
            const isWarning = log.severity === 'WARNING';
            const isSuccess = log.severity === 'SUCCESS';

            const borderClass = isAlert
              ? 'border-l-[#cb5521] bg-[#fcfaf5]'
              : isWarning
              ? 'border-l-[#ffe95c] bg-[#fcfaf5]'
              : isSuccess
              ? 'border-l-[#1a3300] bg-[#d5f5c2]/40'
              : 'border-l-[#a8e5e5] bg-[#fcfaf5]';

            return (
              <div
                key={log.id}
                className={`p-3 rounded-[6px] border border-[#1a3300] border-l-4 ${borderClass} space-y-1 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1a3300] flex items-center gap-1.5">
                    {isAlert ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#cb5521]" />
                    ) : isWarning ? (
                      <Bell className="w-3.5 h-3.5 text-[#1a3300]" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[#1a3300]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[#1a3300]" />
                    )}
                    <span>{log.title}</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#1a3300]/60">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-[#1a3300]/80 font-sans leading-relaxed">
                  {log.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
