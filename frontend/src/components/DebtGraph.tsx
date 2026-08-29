'use client';

import React, { useState } from 'react';
import { ArrowRight, RefreshCw, Layers, CheckCircle2, DollarSign } from 'lucide-react';
import { DebtSimplificationResult, Settlement } from '../../../shared/types';
import { fetchSimplifiedDebts } from '../services/api';

interface Props {
  onPaySettlement?: (settlement: Settlement) => void;
}

export const DebtGraph: React.FC<Props> = ({ onPaySettlement }) => {
  const [data, setData] = useState<DebtSimplificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompute = async () => {
    setLoading(true);
    try {
      const res = await fetchSimplifiedDebts();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-purple" />
          <span>Debt Simplification Engine</span>
        </h3>
        <button
          onClick={handleCompute}
          disabled={loading}
          className="py-1 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-mono text-xs rounded-lg border border-purple-500/40 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Min-Cash-Flow</span>
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Greedy bipartite graph reduction algorithm that eliminates circular debts and compresses raw IOUs down to the minimal transaction count.
      </p>

      {data ? (
        <div className="space-y-3">
          {/* Comparison Metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-center font-mono">
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Raw IOUs</div>
              <div className="text-sm font-bold text-rose-400">{data.raw_debts_count} transfers</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Optimized</div>
              <div className="text-sm font-bold text-emerald-400">{data.simplified_transfers_count} transfers</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Total Settling</div>
              <div className="text-sm font-bold text-cyan-400">₹{data.total_volume_cleared.toFixed(2)}</div>
            </div>
          </div>

          {/* Settlement List */}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {data.settlements.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-xl text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All household balances are completely settled!</span>
              </div>
            ) : (
              data.settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-gray-300">{s.from_roommate_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-medium text-white">{s.to_roommate_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-400">₹{s.amount.toFixed(2)}</span>
                    {onPaySettlement && (
                      <button
                        onClick={() => onPaySettlement(s)}
                        className="py-1 px-2 text-[10px] font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded border border-cyan-500/40"
                      >
                        UPI Pay ↗
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 border border-dashed border-slate-800 rounded-xl text-center">
          <p className="text-xs text-gray-500 font-mono">Click "Run Min-Cash-Flow" to compute optimal net transfers.</p>
        </div>
      )}
    </div>
  );
};
