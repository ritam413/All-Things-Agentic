'use client';

import React, { useState } from 'react';
import { ArrowRight, RefreshCw, Layers, CheckCircle2, DollarSign } from 'lucide-react';
import { DebtSimplificationResult, Settlement } from '../../../shared/types';
import { fetchSimplifiedDebts } from '../services/api';

interface Props {
  householdId?: string;
  onPaySettlement?: (settlement: Settlement) => void;
}

export const DebtGraph: React.FC<Props> = ({ householdId, onPaySettlement }) => {
  const [data, setData] = useState<DebtSimplificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompute = async () => {
    setLoading(true);
    try {
      const res = await fetchSimplifiedDebts(householdId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfaf5] p-6 space-y-4 rounded-[12px] border border-[#1a3300] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a3300] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#1a3300]" />
          <span>Debt Simplification</span>
        </h3>
        <button
          onClick={handleCompute}
          disabled={loading}
          className="py-1.5 px-3 bg-[#a8e5e5] hover:bg-[#95dada] text-[#1a3300] font-mono text-xs rounded-[6px] border border-[#1a3300] flex items-center gap-1.5 font-medium transition-transform active:scale-[0.97]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Min-Cash-Flow</span>
        </button>
      </div>

      <p className="text-xs text-[#1a3300]/70 font-sans leading-relaxed">
        Greedy bipartite graph reduction algorithm that compresses circular debts down to minimal pairwise settlements.
      </p>

      {data ? (
        <div className="space-y-3">
          {/* Comparison Metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#fcfaf5] rounded-[8px] border border-[#b6b6b6] text-center font-mono">
            <div>
              <div className="text-[10px] text-[#1a3300]/60 uppercase">Raw IOUs</div>
              <div className="text-sm font-bold text-[#cb5521]">{data.raw_debts_count} transfers</div>
            </div>
            <div>
              <div className="text-[10px] text-[#1a3300]/60 uppercase">Optimized</div>
              <div className="text-sm font-bold text-[#1a3300]">{data.simplified_transfers_count} transfers</div>
            </div>
            <div>
              <div className="text-[10px] text-[#1a3300]/60 uppercase">Total Settling</div>
              <div className="text-sm font-bold text-[#1a3300]">₹{data.total_volume_cleared.toFixed(2)}</div>
            </div>
          </div>

          {/* Settlement List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {data.settlements.length === 0 ? (
              <div className="p-4 bg-[#d5f5c2] rounded-[8px] border border-[#1a3300] text-center text-xs text-[#1a3300] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                <span className="font-medium">All household balances are completely settled!</span>
              </div>
            ) : (
              data.settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#d5f5c2] rounded-[6px] border border-[#1a3300] flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-medium text-[#1a3300]">{s.from_roommate_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1a3300]" />
                    <span className="font-bold text-[#1a3300]">{s.to_roommate_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#1a3300]">₹{s.amount.toFixed(2)}</span>
                    {onPaySettlement && (
                      <button
                        onClick={() => onPaySettlement(s)}
                        className="py-1 px-2.5 text-[10px] font-mono bg-[#1a3300] text-[#fcfaf5] rounded-[6px] font-medium transition-transform active:scale-[0.97]"
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
        <div className="p-6 border border-dashed border-[#b6b6b6] rounded-[8px] text-center bg-[#fcfaf5]">
          <p className="text-xs text-[#1a3300]/60 font-mono">Click "Run Min-Cash-Flow" to compute optimal net transfers.</p>
        </div>
      )}
    </div>
  );
};
