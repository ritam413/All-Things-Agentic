'use client';

import React, { useState } from 'react';
import { UploadCloud, Sparkles, FileText, Zap } from 'lucide-react';
import { parseReceiptFile, ingestPresetBill } from '../services/api';
import { ParsedExpense, SplitRuleType } from '../../../shared/types';

interface Props {
  onBillIngested: () => void;
}

export const ReceiptDropzone: React.FC<Props> = ({ onBillIngested }) => {
  const [loading, setLoading] = useState(false);
  const [splitRule, setSplitRule] = useState<SplitRuleType>('EQUAL');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await parseReceiptFile(file);
      onBillIngested();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = async (presetType: string) => {
    setLoading(true);
    try {
      await ingestPresetBill(presetType, splitRule);
      onBillIngested();
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
          <Sparkles className="w-5 h-5 text-brand-cyan" />
          <span>Multimodal Ingestion</span>
        </h3>
        <span className="text-xs font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
          Gemini 2.5/3.5 Vision
        </span>
      </div>

      <p className="text-xs text-gray-400">
        Drop a bill photo, PDF invoice, or utility screenshot. The agent extracts line items and computes split shares automatically.
      </p>

      {/* Upload Box */}
      <label className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/80 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40">
        <UploadCloud className={`w-10 h-10 text-cyan-400 mb-2 ${loading ? 'animate-bounce' : ''}`} />
        <span className="text-sm font-medium text-gray-200">
          {loading ? 'Gemini Extracting Bill Details...' : 'Click to Upload or Drag & Drop'}
        </span>
        <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</span>
        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" disabled={loading} />
      </label>

      {/* Split Rule Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-gray-400">Default Split Rule:</label>
        <div className="grid grid-cols-3 gap-2">
          {(['EQUAL', 'ROOM_AREA', 'PERCENTAGE'] as SplitRuleType[]).map((rule) => (
            <button
              key={rule}
              type="button"
              onClick={() => setSplitRule(rule)}
              className={`py-1.5 px-2 text-[11px] font-mono rounded-lg border transition-all ${
                splitRule === rule
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                  : 'bg-slate-900 text-gray-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {rule === 'ROOM_AREA' ? 'By Room Size' : rule === 'PERCENTAGE' ? 'Custom %' : 'Equal 50/50'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Demo Preset Buttons */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="text-[11px] font-mono text-gray-400 mb-2 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>One-Click Hackathon Presets:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePreset('electricity')}
            disabled={loading}
            className="py-1.5 px-2.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-700 hover:border-cyan-500/50 flex items-center justify-between"
          >
            <span>⚡ Electricity</span>
            <span className="text-[10px] text-gray-500">₹2,450</span>
          </button>
          <button
            onClick={() => handlePreset('wifi')}
            disabled={loading}
            className="py-1.5 px-2.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-700 hover:border-cyan-500/50 flex items-center justify-between"
          >
            <span>🌐 Airtel Wifi</span>
            <span className="text-[10px] text-gray-500">₹1,199</span>
          </button>
          <button
            onClick={() => handlePreset('groceries')}
            disabled={loading}
            className="py-1.5 px-2.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-700 hover:border-cyan-500/50 flex items-center justify-between"
          >
            <span>🛒 Groceries</span>
            <span className="text-[10px] text-gray-500">₹3,280</span>
          </button>
          <button
            onClick={() => handlePreset('rent')}
            disabled={loading}
            className="py-1.5 px-2.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-700 hover:border-cyan-500/50 flex items-center justify-between"
          >
            <span>🏢 Flat Rent</span>
            <span className="text-[10px] text-gray-500">₹60,000</span>
          </button>
        </div>
      </div>
    </div>
  );
};
