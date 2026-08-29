'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_HOUSEHOLD_ID,
  Household,
  Expense,
  SplitShare,
  AgentActivityLog,
  Settlement,
  HouseholdSettlementStatus,
} from '../../../shared/types';
import {
  fetchHousehold,
  fetchExpenses,
  fetchActivityLogs,
  fetchSettlementStatus,
} from '../services/api';
import { ReceiptDropzone } from '../components/ReceiptDropzone';
import { DebtGraph } from '../components/DebtGraph';
import { AgentActivityStream } from '../components/AgentActivityStream';
import { PaymentModal } from '../components/PaymentModal';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { RoommateBadges } from '../components/RoommateBadges';
import { UserProfileModal } from '../components/UserProfileModal';
import { AuthModal } from '../components/AuthModal';
import { GroupManagementModal } from '../components/GroupManagementModal';
import { WhoPaidTracker } from '../components/WhoPaidTracker';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Home,
  Sparkles,
  CreditCard,
  Layers,
  ExternalLink,
  ShieldCheck,
  Settings,
  LogIn,
  Check,
  Building,
  Users,
  ChevronDown,
  UserPlus,
  ArrowRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, personas, switchPersona, isLoading: authLoading } = useAuth();

  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>(DEFAULT_HOUSEHOLD_ID);
  const [household, setHousehold] = useState<Household | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activityLogs, setActivityLogs] = useState<AgentActivityLog[]>([]);
  const [settlementStatus, setSettlementStatus] = useState<HouseholdSettlementStatus | null>(null);

  const [selectedShare, setSelectedShare] = useState<SplitShare | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const loadData = useCallback(async (hhId = selectedHouseholdId) => {
    try {
      const [hh, exp, logs, status] = await Promise.all([
        fetchHousehold(hhId).catch(() => null),
        fetchExpenses(hhId).catch(() => []),
        fetchActivityLogs(hhId).catch(() => []),
        fetchSettlementStatus(hhId).catch(() => null),
      ]);
      if (hh) setHousehold(hh);
      setExpenses(exp);
      setActivityLogs(logs);
      if (status) setSettlementStatus(status);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [selectedHouseholdId]);

  useEffect(() => {
    loadData(selectedHouseholdId);
    const interval = setInterval(() => loadData(selectedHouseholdId), 8000); // Auto-poll every 8s
    return () => clearInterval(interval);
  }, [selectedHouseholdId, loadData]);

  const handleSelectHousehold = (newHhId: string) => {
    setSelectedHouseholdId(newHhId);
    loadData(newHhId);
  };

  const handleOpenPay = (share: SplitShare) => {
    setSelectedSettlement(null);
    setSelectedShare(share);
    setIsPayModalOpen(true);
  };

  const handlePaySettlement = (settlement: Settlement) => {
    setSelectedShare(null);
    setSelectedSettlement(settlement);
    setIsPayModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#fcfaf5] text-[#1a3300] p-4 sm:p-6 lg:p-10 max-w-[1200px] mx-auto space-y-12 font-sans">
      {/* 1. Floating Pill Top Navigation Bar */}
      <header className="bg-[#fcfaf5] border border-[#b6b6b6] rounded-[16px] p-3 sm:px-6 sm:py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {/* Logo Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ffe95c] rounded-[6px] border border-[#1a3300] flex items-center justify-center font-bold text-[#1a3300] text-base shadow-sm">
            lo
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-[#1a3300] flex items-center gap-2">
              <span>SayBriefly</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-[#d5f5c2] border border-[#1a3300] rounded-full">
                RoomieOps AI
              </span>
            </div>
            <p className="text-[11px] text-[#1a3300]/70 font-mono">
              The Taskmaster • Autonomous Rent & Expense Agent
            </p>
          </div>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* Active Household Switcher Pill */}
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#fcfaf5] border border-[#b6b6b6] hover:border-[#1a3300] rounded-[6px] transition-transform active:scale-[0.97] text-left"
          >
            <Building className="w-3.5 h-3.5 text-[#1a3300]" />
            <span className="text-xs font-semibold text-[#1a3300]">
              {household?.name || 'Loading Flat...'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#1a3300]/60" />
          </button>

          {/* User Persona Chip */}
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#d5f5c2] border border-[#1a3300] rounded-[6px]">
              <span className="text-xs font-bold text-[#1a3300]">
                {currentUser.name}
              </span>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Edit Profile & UPI VPA"
                className="p-0.5 text-[#1a3300] hover:bg-[#1a3300]/10 rounded-[4px]"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3 py-1.5 bg-[#fcfaf5] border border-[#1a3300] text-[#1a3300] font-medium text-xs rounded-[6px] transition-transform active:scale-[0.97] flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login / Register</span>
          </button>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#1a3300] text-[#fcfaf5] font-medium text-xs rounded-[6px] transition-transform active:scale-[0.97] flex items-center gap-1.5 shadow-sm"
          >
            <span>FastAPI Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* 2. Hero Section: Display Headline with Yellow Marker Wash */}
      <section className="text-center max-w-3xl mx-auto space-y-5 pt-2 sm:pt-4">
        {/* Eyebrow Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffe95c] border border-[#1a3300] rounded-[6px] text-xs font-medium text-[#1a3300]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Google Agentic Hackathon 2026 • The Taskmaster Track</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[#1a3300] tracking-[0.04em] leading-[1.05]">
          Split expenses. Settle debts.{' '}
          <span className="bg-[#ffe95c] px-2.5 py-0.5 rounded-[4px] inline-block shadow-sm">
            Say Briefly.
          </span>
        </h1>

        {/* Hero Subhead Paragraph */}
        <p className="text-base sm:text-lg text-[#1a3300]/80 font-normal leading-relaxed max-w-[620px] mx-auto">
          Autonomous background operator that extracts bill line items, calculates weighted shares, and resolves household IOUs through zero-custody UPI deep links.
        </p>

        {/* Backed-by & Platform Credibility Strip */}
        <div className="flex items-center justify-center gap-6 pt-3 text-xs font-mono text-[#b6b6b6] flex-wrap">
          <span className="uppercase text-[11px] font-semibold text-[#1a3300]/60">Powered by:</span>
          <span className="px-2 py-0.5 bg-[#fcfaf5] border border-[#b6b6b6] rounded-[4px] text-[#1a3300] font-medium">Gemini Vision AI</span>
          <span className="px-2 py-0.5 bg-[#fcfaf5] border border-[#b6b6b6] rounded-[4px] text-[#1a3300] font-medium">Google Cloud Run</span>
          <span className="px-2 py-0.5 bg-[#fcfaf5] border border-[#b6b6b6] rounded-[4px] text-[#1a3300] font-medium">Min-Cash-Flow Graph</span>
          <span className="px-2 py-0.5 bg-[#fcfaf5] border border-[#b6b6b6] rounded-[4px] text-[#1a3300] font-medium">UPI Direct Links</span>
        </div>
      </section>

      {/* 3. Demo Persona Quick-Switcher Bar & Group Actions */}
      <section className="bg-[#fcfaf5] border border-[#1a3300] rounded-[12px] p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#ffe95c] border border-[#1a3300] text-[#1a3300] rounded-[6px]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1a3300]">1-Click Demo Persona Switcher</span>
            <p className="text-[11px] font-mono text-[#1a3300]/70">Zero-friction roommate simulation & profile swaps</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 flex-wrap">
            {personas.map((p) => {
              const isActive = currentUser?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={async () => {
                    await switchPersona(p.id);
                    toast.success(`Switched persona to ${p.name.split(' ')[0]}`, {
                      description: `Active UPI Handle: ${p.upi_vpa}`,
                    });
                  }}
                  disabled={authLoading}
                  className={`px-3 py-1.5 rounded-[6px] font-mono text-xs transition-transform active:scale-[0.97] flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1a3300] text-[#fcfaf5] font-bold shadow-sm'
                      : 'bg-[#fcfaf5] text-[#1a3300] border border-[#b6b6b6] hover:border-[#1a3300]'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-[#ffe95c]' : 'bg-[#b6b6b6]'
                    }`}
                  />
                  <span>{p.name.split(' ')[0]}</span>
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="px-3 py-1.5 bg-[#a8e5e5] hover:bg-[#96dada] text-[#1a3300] font-mono text-xs font-semibold rounded-[6px] border border-[#1a3300] transition-transform active:scale-[0.97] flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Manage Group / People</span>
          </button>
        </div>
      </section>

      {/* 4. Roommate Habit Badges & Memory */}
      {household && <RoommateBadges roommates={household.roommates} />}

      {/* 5. Autonomous Time-Travel Simulator */}
      <TimeTravelSlider householdId={selectedHouseholdId} onTimeTravel={() => loadData(selectedHouseholdId)} />

      {/* 6. "Who Has Paid vs Who Is Left" Real-Time Settlement Matrix */}
      <WhoPaidTracker
        settlementStatus={settlementStatus}
        onPayShare={handleOpenPay}
        onRefresh={() => loadData(selectedHouseholdId)}
      />

      {/* 7. 3-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multimodal Receipt Ingestion */}
        <div className="lg:col-span-4 space-y-6">
          <ReceiptDropzone
            householdId={selectedHouseholdId}
            onBillIngested={() => loadData(selectedHouseholdId)}
          />
        </div>

        {/* Middle Column: Active Expense Ledger */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#fcfaf5] p-6 space-y-4 rounded-[12px] border border-[#1a3300] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a3300] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1a3300]" />
                <span>Active Expense Ledger</span>
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] rounded-full">
                {expenses.length} Bills
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <div className="p-6 bg-[#fcfaf5] rounded-[8px] border border-dashed border-[#b6b6b6] text-center text-xs text-[#1a3300]/60 font-mono">
                  No active bills for {household?.name || 'this group'}. Ingest a receipt or click a preset on the left!
                </div>
              ) : (
                expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-[#fcfaf5] rounded-[8px] border border-[#b6b6b6] hover:border-[#1a3300] transition-colors space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-[#1a3300]">{exp.vendor}</div>
                        <div className="text-[11px] font-mono text-[#1a3300]/70">
                          Paid by: <span className="font-semibold text-[#1a3300]">{exp.payer_name}</span> • Due: {exp.due_date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-[#1a3300]">
                          ₹{exp.total_amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#ffe95c] text-[#1a3300] border border-[#1a3300] rounded">
                          {exp.split_rule}
                        </span>
                      </div>
                    </div>

                    {/* Split Shares Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-[#b6b6b6]/50">
                      {exp.shares.map((share) => {
                        const isPaid = share.status === 'PAID';
                        return (
                          <div
                            key={share.id}
                            className="flex items-center justify-between text-xs font-mono"
                          >
                            <span className="text-[#1a3300]/80">{share.roommate_name}</span>
                            <div className="flex items-center gap-2">
                              <span className={isPaid ? 'text-[#1a3300] font-bold' : 'text-[#cb5521] font-semibold'}>
                                ₹{share.amount_owed.toFixed(2)}
                              </span>
                              {isPaid ? (
                                <span className="text-[9px] px-1.5 py-0.5 bg-[#d5f5c2] text-[#1a3300] rounded border border-[#1a3300]">
                                  PAID
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenPay(share)}
                                  className="text-[10px] px-2 py-0.5 bg-[#1a3300] hover:bg-[#1a3300]/90 text-[#fcfaf5] rounded-[6px] font-semibold transition-transform active:scale-[0.97]"
                                >
                                  Pay UPI ↗
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Debt Graph & Live Agent Stream */}
        <div className="lg:col-span-4 space-y-6">
          <DebtGraph
            householdId={selectedHouseholdId}
            onPaySettlement={handlePaySettlement}
          />
          <AgentActivityStream
            logs={activityLogs}
            onRefresh={() => loadData(selectedHouseholdId)}
          />
        </div>
      </div>

      {/* 8. Modals */}
      <PaymentModal
        share={selectedShare}
        settlement={selectedSettlement}
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedShare(null);
          setSelectedSettlement(null);
        }}
        onPaymentSuccess={() => loadData(selectedHouseholdId)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => loadData(selectedHouseholdId)}
      />

      <GroupManagementModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        currentHouseholdId={selectedHouseholdId}
        onSelectHousehold={handleSelectHousehold}
        onHouseholdUpdated={() => loadData(selectedHouseholdId)}
      />
    </main>
  );
}
