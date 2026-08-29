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
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-emerald" />
          <span>Agent Activity & Audit Stream</span>
        </h3>
        <button
          onClick={onRefresh}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          Refresh Feed
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Immutable chronological audit trail of all background decisions, autonomous due-date scans, and tone escalations.
      </p>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="p-4 bg-slate-950/40 rounded-xl text-center text-xs text-gray-500 font-mono">
            No agent activity logged yet.
          </div>
        ) : (
          logs.map((log) => {
            const isAlert = log.severity === 'ALERT';
            const isWarning = log.severity === 'WARNING';
            const isSuccess = log.severity === 'SUCCESS';

            const borderColor = isAlert
              ? 'border-l-rose-500'
              : isWarning
              ? 'border-l-amber-500'
              : isSuccess
              ? 'border-l-emerald-500'
              : 'border-l-cyan-500';

            return (
              <div
                key={log.id}
                className={`p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 border-l-4 ${borderColor} space-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    {isAlert ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    ) : isWarning ? (
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{log.title}</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
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
