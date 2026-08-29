'use client';

import React, { useState } from 'react';
import { UploadCloud, Sparkles, FileText, Zap } from 'lucide-react';
import { parseReceiptFile, ingestPresetBill } from '../services/api';
import { ParsedExpense, SplitRuleType } from '../../../shared/types';
import { toast } from 'sonner';

interface Props {
  householdId?: string;
  onBillIngested: () => void;
}

export const ReceiptDropzone: React.FC<Props> = ({ householdId, onBillIngested }) => {
  const [loading, setLoading] = useState(false);
  const [splitRule, setSplitRule] = useState<SplitRuleType>('EQUAL');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const toastId = toast.loading(`Uploading ${file.name} to Gemini Vision...`);
    try {
      const parsed = await parseReceiptFile(file, householdId);
      toast.success(`Receipt parsed: ₹${parsed.total_amount?.toFixed(2) || '0.00'} (${parsed.vendor})`, {
        id: toastId,
        description: `Split calculated using ${splitRule} rule across roommates.`,
      });
      onBillIngested();
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse receipt.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = async (presetType: string) => {
    setLoading(true);
    const toastId = toast.loading(`Ingesting preset ${presetType} bill...`);
    try {
      await ingestPresetBill(presetType, splitRule, householdId);
      toast.success(`Sample ${presetType} bill ingested!`, {
        id: toastId,
        description: `Calculated ${splitRule} split and generated UPI payment intents.`,
      });
      onBillIngested();
    } catch (err) {
      console.error(err);
      toast.error('Failed to ingest preset bill.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfaf5] p-6 space-y-4 rounded-[12px] border border-[#1a3300] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a3300] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1a3300]" />
          <span>Multimodal Ingestion</span>
        </h3>
        <span className="text-xs font-mono px-2 py-0.5 bg-[#d5f5c2] text-[#1a3300] border border-[#1a3300] rounded-full font-medium">
          Gemini Vision
        </span>
      </div>

      <p className="text-xs text-[#1a3300]/70 leading-relaxed font-sans">
        Drop a bill photo, PDF invoice, or screenshot. Gemini extracts line items, calculates the split, and prepares UPI deep links.
      </p>

      {/* Upload Box */}
      <label className="border-2 border-dashed border-[#1a3300]/30 hover:border-[#1a3300] rounded-[8px] p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#fcfaf5] group active:scale-[0.99]">
        <div className="w-10 h-10 rounded-[6px] bg-[#ffe95c] border border-[#1a3300] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
          <UploadCloud className={`w-5 h-5 text-[#1a3300] ${loading ? 'animate-pulse' : ''}`} />
        </div>
        <span className="text-sm font-semibold text-[#1a3300]">
          {loading ? 'Gemini Extracting Bill...' : 'Click to Upload or Drag & Drop'}
        </span>
        <span className="text-xs text-[#1a3300]/60 mt-1 font-mono">PNG, JPG, PDF up to 10MB</span>
        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" disabled={loading} />
      </label>

      {/* Split Rule Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[#1a3300]/70">Default Split Rule:</label>
        <div className="grid grid-cols-3 gap-2">
          {(['EQUAL', 'ROOM_AREA', 'PERCENTAGE'] as SplitRuleType[]).map((rule) => (
            <button
              key={rule}
              type="button"
              onClick={() => {
                setSplitRule(rule);
                toast.info(`Split rule set to ${rule === 'ROOM_AREA' ? 'Room Area' : rule === 'PERCENTAGE' ? 'Custom %' : 'Equal 50/50'}`);
              }}
              className={`py-1.5 px-2 text-[11px] font-mono rounded-[6px] border transition-transform active:scale-[0.97] ${
                splitRule === rule
                  ? 'bg-[#1a3300] text-[#fcfaf5] border-[#1a3300] font-semibold'
                  : 'bg-[#fcfaf5] text-[#1a3300] border-[#b6b6b6] hover:border-[#1a3300]'
              }`}
            >
              {rule === 'ROOM_AREA' ? 'By Room Size' : rule === 'PERCENTAGE' ? 'Custom %' : 'Equal 50/50'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Demo Preset Buttons */}
      <div className="pt-2 border-t border-[#b6b6b6]">
        <div className="text-[11px] font-mono text-[#1a3300]/70 mb-2 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-[#1a3300]" />
          <span>One-Click Hackathon Presets:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePreset('electricity')}
            disabled={loading}
            className="py-2 px-3 text-xs font-mono bg-[#d5f5c2] hover:bg-[#c2edab] text-[#1a3300] rounded-[6px] border border-[#1a3300] flex items-center justify-between transition-transform active:scale-[0.97]"
          >
            <span className="font-medium">⚡ Electricity</span>
            <span className="text-[10px] text-[#1a3300]/80 font-bold">₹2,450</span>
          </button>
          <button
            onClick={() => handlePreset('wifi')}
            disabled={loading}
            className="py-2 px-3 text-xs font-mono bg-[#a8e5e5] hover:bg-[#92dada] text-[#1a3300] rounded-[6px] border border-[#1a3300] flex items-center justify-between transition-transform active:scale-[0.97]"
          >
            <span className="font-medium">🌐 Airtel Wifi</span>
            <span className="text-[10px] text-[#1a3300]/80 font-bold">₹1,199</span>
          </button>
          <button
            onClick={() => handlePreset('groceries')}
            disabled={loading}
            className="py-2 px-3 text-xs font-mono bg-[#f6d0ff] hover:bg-[#efb9fc] text-[#1a3300] rounded-[6px] border border-[#1a3300] flex items-center justify-between transition-transform active:scale-[0.97]"
          >
            <span className="font-medium">🛒 Groceries</span>
            <span className="text-[10px] text-[#1a3300]/80 font-bold">₹3,280</span>
          </button>
          <button
            onClick={() => handlePreset('rent')}
            disabled={loading}
            className="py-2 px-3 text-xs font-mono bg-[#ffe95c] hover:bg-[#fedb34] text-[#1a3300] rounded-[6px] border border-[#1a3300] flex items-center justify-between transition-transform active:scale-[0.97]"
          >
            <span className="font-medium">🏢 Flat Rent</span>
            <span className="text-[10px] text-[#1a3300]/80 font-bold">₹60,000</span>
          </button>
        </div>
      </div>
    </div>
  );
};
