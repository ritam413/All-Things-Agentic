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
    <main className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <header className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
              Google Agentic Hackathon 2026
            </span>
            <span className="px-3 py-1 text-xs font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full">
              The Taskmaster Track
            </span>
            <span className="px-3 py-1 text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Autonomous Agent Active</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            RoomieOps AI
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Autonomous Roommate Rent & Expense Ops Agent • Multi-Group Ledger & Instant Settlements
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {/* Active Household Selector Badge */}
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center gap-2.5 p-2 px-3 bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 rounded-2xl transition-all shadow-lg text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>{household?.name || 'Loading Household...'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <div className="text-[10px] font-mono text-cyan-400">
                {household?.roommates?.length || 0} Roommates • {household?.default_split_rule}
              </div>
            </div>
          </button>

          {/* Active User Persona Chip */}
          {currentUser && (
            <div className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/40 rounded-2xl transition-all shadow-lg">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 truncate max-w-[130px]">
                  {currentUser.upi_vpa || 'No UPI handle'}
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Edit Profile & UPI VPA"
                className="p-1.5 ml-1 text-gray-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="py-2 px-3 bg-slate-900/90 hover:bg-slate-800 text-gray-300 font-mono text-xs rounded-xl border border-slate-700 hover:border-purple-500/40 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3 h-3 text-purple-400" />
              <span>Login / Register</span>
            </button>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-gray-300 font-mono text-xs rounded-xl border border-slate-700 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
            >
              <span>FastAPI Docs</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Demo Persona Quick-Switcher Bar & Group Actions */}
      <div className="glass-card p-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border border-cyan-500/20 bg-slate-950/60 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white">1-Click Demo Persona Switcher</span>
            <p className="text-[11px] font-mono text-gray-400">Zero-friction roommate persona simulation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 flex-wrap">
            {personas.map((p) => {
              const isActive = currentUser?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchPersona(p.id)}
                  disabled={authLoading}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-slate-900 hover:bg-slate-800 text-gray-300 border border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-black animate-pulse' : 'bg-gray-500'
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
            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs rounded-xl border border-cyan-500/30 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Manage Group / People</span>
          </button>
        </div>
      </div>

      {/* Household Badges */}
      {household && <RoommateBadges roommates={household.roommates} />}

      {/* Autonomous Time-Travel Simulator */}
      <TimeTravelSlider householdId={selectedHouseholdId} onTimeTravel={() => loadData(selectedHouseholdId)} />

      {/* "Who Has Paid vs Who Is Left" Real-Time Settlement Matrix Widget */}
      <WhoPaidTracker
        settlementStatus={settlementStatus}
        onPayShare={handleOpenPay}
        onRefresh={() => loadData(selectedHouseholdId)}
      />

      {/* 3-Column Operational Layout */}
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
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-cyan" />
                <span>Active Expense Ledger</span>
              </h3>
              <span className="text-xs font-mono text-gray-500">{expenses.length} Bills</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <div className="p-6 bg-slate-950/40 rounded-xl text-center text-xs text-gray-500 font-mono">
                  No active bills for {household?.name || 'this group'}. Ingest a receipt or click a preset on the left!
                </div>
              ) : (
                expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{exp.vendor}</div>
                        <div className="text-[11px] font-mono text-gray-400">
                          Paid by: <span className="text-cyan-300">{exp.payer_name}</span> • Due: {exp.due_date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-emerald-400">
                          ₹{exp.total_amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-gray-400 rounded">
                          {exp.split_rule}
                        </span>
                      </div>
                    </div>

                    {/* Split Shares Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-900">
                      {exp.shares.map((share) => {
                        const isPaid = share.status === 'PAID';
                        return (
                          <div
                            key={share.id}
                            className="flex items-center justify-between text-xs font-mono"
                          >
                            <span className="text-gray-300">{share.roommate_name}</span>
                            <div className="flex items-center gap-2">
                              <span className={isPaid ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                                ₹{share.amount_owed.toFixed(2)}
                              </span>
                              {isPaid ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                                  PAID
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenPay(share)}
                                  className="text-[10px] px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded border border-cyan-500/40"
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

      {/* Payment Intent Modal */}
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

      {/* User Profile & Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Login & Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => loadData(selectedHouseholdId)}
      />

      {/* Group & Member Management Modal */}
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
