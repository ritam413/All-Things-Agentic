'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  TrendingDown,
  Sparkles,
  Zap,
  Play,
  Pause,
  RefreshCw,
  CreditCard,
  QrCode,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface MoneyFlowVisualizerProps {
  householdName?: string;
}

export function MoneyFlowVisualizer({ householdName = 'Villa 101' }: MoneyFlowVisualizerProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const steps = [
    {
      title: '1. Receipt Ingested',
      category: 'Gemini Vision',
      amount: '₹2,450.00',
      tag: 'Airtel Broadband',
      desc: 'Multimodal AI extracts vendor, date & taxes in 800ms.',
      color: 'bg-[#d5f5c2]',
    },
    {
      title: '2. Weighted Split',
      category: 'Penny-Conserved',
      amount: '₹612.50 / rm',
      tag: '4 Roommates',
      desc: 'Applied Room-Area weighted split with exact penny conservation.',
      color: 'bg-[#a8e5e5]',
    },
    {
      title: '3. Debt Reduced',
      category: 'Min-Cash-Flow',
      amount: '6 IOUs ➔ 2 Transfers',
      tag: '66% Faster',
      desc: 'Circular debts eliminated; greedy graph reduction minimizes transfers.',
      color: 'bg-[#ffe95c]',
    },
    {
      title: '4. Direct UPI Pay',
      category: 'Zero-Custody',
      amount: '₹1,450 ➔ Alex',
      tag: 'Instant Bank Flow',
      desc: 'Instant deep links (GPay/PhonePe) directly to recipient VPA.',
      color: 'bg-[#f6d0ff]',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  return (
    <section className="bg-[#fcfaf5] border border-[#1a3300] rounded-[12px] p-6 space-y-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#ffe95c] border border-[#1a3300] text-[#1a3300] rounded-[6px] shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-[#1a3300] flex items-center gap-2">
              <span>Autonomous Flow of Money</span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-[#d5f5c2] text-[#1a3300] border border-[#1a3300] rounded-full">
                Interactive Graph
              </span>
            </h3>
          </div>
          <p className="text-xs text-[#1a3300]/70 font-sans mt-0.5">
            Visualizing how raw bills convert into optimized, zero-custody peer settlements for {householdName}.
          </p>
        </div>

        {/* Play / Pause Interactive Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-[#fcfaf5] hover:bg-[#e8e4d9] text-[#1a3300] border border-[#1a3300] rounded-[6px] font-mono text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-[0.97]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Flow</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto Play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animated Flow Track Canvas */}
      <div className="relative p-6 bg-[#fcfaf5] rounded-[10px] border border-[#b6b6b6] overflow-hidden">
        {/* Animated Connecting SVG Stream */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line
              x1="12%"
              y1="40%"
              x2="88%"
              y2="40%"
              stroke="#1a3300"
              strokeWidth="2"
              className="money-flow-stream opacity-60"
            />
          </svg>
        </div>

        {/* 4 Step Lifecycle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false);
                }}
                className={`p-4 rounded-[8px] border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isActive
                    ? `${step.color} border-2 border-[#1a3300] shadow-md scale-[1.03]`
                    : 'bg-[#fcfaf5] border-[#b6b6b6] hover:border-[#1a3300] opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a3300]">{step.title}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#fcfaf5] border border-[#1a3300] rounded-full">
                    {step.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-lg font-extrabold text-[#1a3300] tracking-tight">
                    {step.amount}
                  </div>
                  <div className="text-[11px] font-mono text-[#1a3300]/80">{step.tag}</div>
                </div>

                <p className="text-[11px] text-[#1a3300]/80 leading-relaxed font-sans pt-1 border-t border-[#1a3300]/20">
                  {step.desc}
                </p>

                {isActive && (
                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#1a3300] font-bold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#1a3300] animate-ping" />
                      <span>Active Stage</span>
                    </span>
                    <span>Step {idx + 1}/4</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Visual Flow Demonstration Box */}
      <div className="p-4 bg-[#d5f5c2] border border-[#1a3300] rounded-[8px] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ffe95c] border border-[#1a3300] rounded-[6px] flex items-center justify-center font-bold text-[#1a3300] text-sm animate-float-currency">
            ₹
          </div>
          <div>
            <div className="text-xs font-bold text-[#1a3300] flex items-center gap-1.5">
              <span>Live Flow: Priya (Debtor) ➔ Alex (Payee)</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#fcfaf5] border border-[#1a3300] rounded">
                Verified Direct
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#1a3300]/80">
              Net settlements execute peer-to-peer via <span className="font-bold">upi://pay</span> without platform escrow fees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right font-mono">
            <div className="text-[10px] text-[#1a3300]/70">Amount Settling</div>
            <div className="text-base font-extrabold text-[#1a3300]">₹1,450.00</div>
          </div>
          <div className="w-8 h-8 rounded-[6px] bg-[#1a3300] text-[#fcfaf5] flex items-center justify-center font-bold text-xs shadow-sm">
            ✓
          </div>
        </div>
      </div>
    </section>
  );
}
